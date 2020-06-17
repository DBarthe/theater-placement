from dataclasses import asdict
from datetime import datetime
from enum import Enum
from typing import List, Dict

import dacite
from bson import ObjectId

from tragos.database import DatabaseManager
from tragos.models import Event, Requirements, History, Group


class TragosException(Exception):
    pass


class NotFoundException(TragosException):
    pass


class MainService:

    def __init__(self, database_manager: DatabaseManager):
        self.database_manager = database_manager
        self.events = database_manager.events()
        self.venues = database_manager.venues()

    @staticmethod
    def trim_id(d: Dict) -> Dict:
        return {k: v for k, v in d.items() if k != '_id'}

    def list_events(self) -> List[Event]:
        items = self.events.find()
        return [Event(**item) for item in items]

    def create_event(self,
                     name: str,
                     show_date: datetime,
                     venue_id: ObjectId):
        venue = self.venues.find_one({'_id': venue_id})
        if venue is None:
            raise NotFoundException("No venue with id={}".format(venue_id))

        event = Event(name=name, show_date=show_date, venue_id=venue_id,
                      requirements=Requirements(), solution=None, history=History())
        result = self.events.insert_one(self.trim_id(asdict(event)))
        event._id = result.inserted_id
        return event

    def get_event(self, event_id: ObjectId) -> Event:
        event = self.events.find_one({'_id': event_id})
        if event is None:
            raise NotFoundException("No event with id={}".format({event_id}))
        return dacite.from_dict(data_class=Event, data=event, config=dacite.Config(cast=[Enum]))

    def add_group(self, event_id: ObjectId, name: str, size: int, accessibility: bool) -> Event:
        event = self.get_event(event_id)
        group = Group(name=name, size=size, accessibility=accessibility)
        event.requirements.group_queue.append(group)
        self.events.update_one({"_id": event_id}, {"$push": {'requirements.group_queue': asdict(group)}})
        return event
