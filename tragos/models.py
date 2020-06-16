from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict

from bson import ObjectId


@dataclass
class Seat:
    name: str
    x: float
    y: float
    row_n: int
    seat_n: int


@dataclass
class Slot:
    size: int
    row_n: int
    seats: List[Seat]


@dataclass
class Group:
    name: str
    size: int
    accessibility: bool = False
    slot: Optional[Slot] = None

    def __eq__(self, other):
        return isinstance(other, Group) and self.name == other.name

    def __hash__(self):
        return hash(self.name)


@dataclass
class Venue:
    _id: Optional[ObjectId] = None

    @property
    def id(self):
        return self._id


class Phase(str, Enum):
    NORMAL = "NORMAL"
    ON_SITE = "ON_SIZE"
    CLOSING = "CLOSING"
    FINISHED = "FINISHED"


@dataclass
class Requirements:
    group_queue: List[Group] = field(default_factory=lambda: [])
    lock_accessibility: bool = True
    phase: Phase = Phase.NORMAL


class SeatStatus(str, Enum):
    EMPTY = "EMPTY"
    OCCUPIED = "OCCUPIED"
    BLOCKED = "BLOCKED"


@dataclass
class Solution:
    success: bool

    # stats
    num_seats_occupied = int
    num_seats_blocked = int
    num_seat_empty = int
    num_groups_placed = int
    num_groups_declined = int
    covid_score = int

    # group name -> slot
    estimated_placement = Dict[str, Slot]

    # seat name -> seat status
    seats_status = Dict[str, SeatStatus]


@dataclass
class Action:
    pass


@dataclass
class HistoryItem:
    date: datetime
    action: Action
    requirements: Requirements
    solution: Optional[Solution]


@dataclass
class History:
    items: List[HistoryItem] = field(default_factory=lambda: [])


@dataclass
class Event:
    name: str
    show_date: datetime
    requirements: Requirements
    solution: Optional[Solution]
    history: History
    venue_id: ObjectId
    _id: Optional[ObjectId] = None
