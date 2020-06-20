from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List

from bson import ObjectId


@dataclass
class Seat:
    # name displayed in the venue and printed on tickets
    row_name: str
    col_name: str

    # Row and column index
    row_n: int
    seat_n: int

    # Exact location
    x: float
    y: float

    # specific requirement
    accessible: bool

    # value of the place according to distance and angle to center of the stage
    value: Optional[float] = None


@dataclass
class Slot:
    size: int
    row_n: int
    seat_n: int
    seats: List[Seat]


@dataclass
class Group:
    group_n: Optional[int]
    name: str
    size: int
    accessibility: bool = False
    slot: Optional[Slot] = None

    def __eq__(self, other):
        return isinstance(other, Group) and self.name == other.name

    def __hash__(self):
        return hash(self.name)


@dataclass
class Row:
    name: str
    row_n: int
    seats: List[Seat]


@dataclass
class Venue:
    stage_center_x: float
    stage_center_y: float
    num_seats: int
    _id: Optional[ObjectId] = None
    rows: List[Row] = field(default_factory=lambda: [])

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
    max_group_size: int = 6
    min_distance: float = 1.5


class SeatStatus(str, Enum):
    EMPTY = "EMPTY"
    OCCUPIED = "OCCUPIED"
    BLOCKED = "BLOCKED"


@dataclass
class SeatSolution:
    status: SeatStatus
    slot_n: Optional[int] = None
    group_n: Optional[int] = None


@dataclass
class Solution:
    # true if all groups are placed, otherwise false
    success: bool

    num_groups_placed: int
    num_groups_declined: int

    # stats
    num_seats_occupied: int
    num_seats_blocked: int
    num_seats_empty: int

    covid_score: float

    # list of slots
    slots: List[Slot]

    # group_n -> slot_n or None if no solution found
    assignments: List[Optional[int]]

    # seat (row_n, seat_n) -> seat solution
    grid: List[List[SeatSolution]]


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
