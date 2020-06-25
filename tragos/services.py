from dataclasses import asdict
from datetime import datetime
from enum import Enum
from typing import List, Dict, Tuple

import dacite
from bson import ObjectId

from tragos import engine
from tragos.database import DatabaseManager
from tragos.fake import create_requirements, create_venue_grid
from tragos.models import Event, Requirements, History, Group, Venue, Solution


class TragosException(Exception):
    pass


class NotFoundException(TragosException):
    pass


class MainService:
    """
    This class encapsulates the main logic of the application, managing the objects states, dealing with the database,
    calling the cpu-expensive tasks.
    """

    def __init__(self, database_manager: DatabaseManager):
        self.database_manager = database_manager
        self.events = database_manager.events()
        self.venues = database_manager.venues()

    def create_fake_event(self, name: str, num_rows: int, row_len: int,
                          accessible_seats: List[Tuple[int, int]],
                          num_groups: int, min_distance: float, accessibility_rate: float
                          ) -> Event:
        """
        Create a fake event with a fake venue.
        Testing and debug purpose.
        """
        venue = create_venue_grid(num_rows, row_len, accessible_seats)
        requirements = create_requirements(num_groups=num_groups, min_distance=min_distance,
                                           accessibility_rate=accessibility_rate)
        venue_result = self.venues.insert_one(self.__trim_id(asdict(venue)))
        event = Event(name=name, show_date=datetime.now(), venue_id=venue_result.inserted_id,
                      requirements=requirements, solution=None, history=History())
        result = self.events.insert_one(self.__trim_id(asdict(event)))
        event._id = result.inserted_id
        return event

    @staticmethod
    def __trim_id(d: Dict) -> Dict:
        """
        Util function to remove field '_id' from a dictionary.
        Helps dealing with mongodb insert.
        """

        return {k: v for k, v in d.items() if k != '_id'}

    def list_events(self) -> List[Event]:
        """
        List all events
        """
        items = self.events.find()
        return [Event(**item) for item in items]

    def get_venue(self, venue_id: ObjectId) -> Venue:
        """
        Get a venue by Id
        """
        venue = self.venues.find_one({'_id': venue_id})
        if venue is None:
            raise NotFoundException("No venue with id={}".format({venue_id}))
        return dacite.from_dict(data_class=Venue, data=venue, config=dacite.Config(cast=[Enum]))

    def create_event(self,
                     name: str,
                     show_date: datetime,
                     venue_id: ObjectId):
        """
        Create a new event from scratch
        """
        # ensure venue exists
        self.get_venue(venue_id=venue_id)
        event = Event(name=name, show_date=show_date, venue_id=venue_id,
                      requirements=Requirements(), solution=None, history=History())
        result = self.events.insert_one(self.__trim_id(asdict(event)))
        event._id = result.inserted_id
        return event

    def get_event(self, event_id: ObjectId) -> Event:
        """
        Get an event by Id
        """
        event = self.events.find_one({'_id': event_id})
        if event is None:
            raise NotFoundException("No event with id={}".format({event_id}))
        return dacite.from_dict(data_class=Event, data=event, config=dacite.Config(cast=[Enum]))

    def add_group(self, event_id: ObjectId, name: str, size: int, accessibility: bool) -> Event:
        """
        Add a new group but do not invalidate the current solution.
        """
        event = self.get_event(event_id)
        group = Group(name=name, size=size, accessibility=accessibility, group_n=len(event.requirements.group_queue))
        event.requirements.group_queue.append(group)
        self.events.update_one({"_id": event_id}, {"$push": {'requirements.group_queue': asdict(group)}})
        return event

    def update_group(self, event_id: ObjectId, group: Group):
        """
        Update a group, invalidate the current solution if any.
        """

        event = self.get_event(event_id)
        if group.group_n is None:
            raise TragosException("can't update a group with no group_n")
        if not (0 <= group.group_n < len(event.requirements.group_queue)):
            raise TragosException("can't update a group which does not exist")
        event.requirements.group_queue[group.group_n] = group
        event.solution = None
        self.events.update_one({"_id": event_id}, {
            "$set": {
                'requirements.group_queue.' + str(group.group_n): asdict(group),
                'solution': None
            }
        })
        return event

    def delete_group(self, event_id: ObjectId, group_n: int):
        """
        Delete a group from the group queue, invalidate the current solution if any.
        """

        event = self.get_event(event_id)
        if not (0 <= group_n < len(event.requirements.group_queue)):
            raise TragosException("can't delete a group which does not exist")

        def update_group_n(group: Group, n: int) -> Group:
            group.group_n = n
            return group

        group_queue = [
            update_group_n(group, group.group_n if group.group_n < group_n else group.group_n - 1)
            for group in event.requirements.group_queue
            if group.group_n != group_n
        ]
        event.requirements.group_queue = group_queue
        event.solution = None
        self.events.update_one({"_id": event_id}, {
            "$set": {
                'requirements.group_queue': [asdict(group) for group in group_queue],
                'solution': None
            }
        })
        return event

    def compute_solution(self, event_id: ObjectId) -> Solution:
        """
        Compute a solution based on actual requirement and venue, overriding previous solution if any
        """
        event = self.get_event(event_id)
        venue = self.get_venue(event.venue_id)
        solution = engine.start(venue=venue, requirements=event.requirements, max_expand=100, max_loop=500)
        self.events.update_one({"_id": event_id}, {"$set": {'solution': asdict(solution)}})
        return solution

    def unlock_accessible_seats(self, event_id: ObjectId) -> Event:
        """
        Permit everyone to use accessible seats.
        A solution must be computed before calling this method.
        It will lock every 'accessible' group so that they cannot be squeezed
        No need to recompute solution after this, but a lock will appears on accessible seats previously occupied.
        If the user recomputes, remaining accessible seats will be available to other groups.
        """

        event = self.get_event(event_id)

        if event.solution is None:
            raise TragosException("a solution need to be computed before unlocking accessible seats")

        event.requirements.lock_accessibility = False
        for group in event.requirements.group_queue:
            if group.accessibility and group.slot is None:
                slot_n = event.solution.assignments[group.group_n]
                if slot_n is not None:
                    group.accessible_locked = True

        self.events.update_one({"_id": event_id}, {"$set": {
            'requirements': asdict(event.requirements),
            'solution': asdict(event.solution)
        }})
        return event

    def lock_accessible_seats(self, event_id: ObjectId) -> Event:
        """
        Only assign "accessible" groups to accessible slots.
        Assigned accessible seats will remains locked however.
        The current solution is invalidated. The user need to recompute after re-locking this.
        """

        event = self.get_event(event_id)
        event.requirements.lock_accessibility = True
        for group in event.requirements.group_queue:
            if group.accessibility:
                group.accessible_locked = False
        event.solution = None
        self.events.update_one({"_id": event_id}, {"$set": {
            'requirements': asdict(event.requirements),
            'solution': None
        }})
        return event

