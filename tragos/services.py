from datetime import datetime
from typing import List
from uuid import UUID, uuid4

from tragos.models import TragosData, Event, Requirements, History


class TragosException(Exception):
    pass


class NotFoundException(TragosException):
    pass


def list_events(data: TragosData) -> List[Event]:
    items = data.events.values()
    return list(items)


def create_event(data: TragosData,
                 name: str,
                 show_date: datetime,
                 venue_uid: str):
    venue = data.get_venue(uid=venue_uid)
    if venue is None:
        raise NotFoundException("No venue with uid={}".format(venue_uid))

    event = Event(uid=str(uuid4()), name=name, show_date=show_date, venue=venue,
                  requirements=Requirements(), solution=None, history=History())
    data.events.insert(event.uid, event)
    return event
