from dataclasses import asdict
from datetime import datetime
from typing import List, Dict

from bson import ObjectId

from tragos.database import DatabaseManager
from tragos.models import Event, Requirements, History


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
        return event
