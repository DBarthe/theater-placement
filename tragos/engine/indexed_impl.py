from itertools import islice, takewhile
from math import sqrt
from typing import NamedTuple, List, Dict, Generator, Tuple, Set

from tragos.engine.core import State, Implementation
from tragos.models import Group, Venue


class IndexedSlot(NamedTuple):
    row_n: int
    seat_n: int
    size: int


class IndexedSeat(NamedTuple):
    row_n: int
    seat_n: int


class BitSetIndex:

    def __init__(self, size, value=0):
        self._size = size
        self._value = value

    def __repr__(self):
        return ("{0:0" + str(self._size) + "b}").format(self._value)[::-1]

    def __eq__(self, other: 'BitSetIndex') -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def get(self, index: int) -> bool:
        return self._value & 1 << index != 0

    def add(self, index: int):
        self._value |= 1 << index

    def remove(self, index: int):
        self._value &= ~(1 << index)

    def inverse(self):
        self._value = (~self._value) & ((1 << self._value.bit_length()) - 1)

    def iterate(self) -> Generator[int, None, None]:
        mask = 1
        for i in range(self._size):
            if self._value & mask != 0:
                yield i
            mask <<= 1

    def any(self) -> bool:
        return self._value != 0

    def clone(self) -> 'BitSetIndex':
        return BitSetIndex(size=self._size, value=self._value)

    @staticmethod
    def from_list(bool_array: List[bool]) -> 'BitSetIndex':
        value = 0
        for b in reversed(bool_array):
            value = (value << 1) | (1 if b else 0)
        return BitSetIndex(size=len(bool_array), value=value)

    @staticmethod
    def union(indexes: List['BitSetIndex']) -> 'BitSetIndex':
        size = max(index._size for index in indexes)
        value = 0
        for index in indexes:
            value |= index._value
        return BitSetIndex(size=size, value=value)

    @staticmethod
    def intersect(indexes: List['BitSetIndex']) -> 'BitSetIndex':
        assert len(indexes) > 0
        size = max(index._size for index in indexes)
        value = indexes[0]._value
        for index in islice(indexes, 1, None):
            value &= index._value
        return BitSetIndex(size=size, value=value)

    @staticmethod
    def inverted(index: 'BitSetIndex'):
        inverted_index = index.clone()
        inverted_index.inverse()
        return inverted_index


class MetaState:

    def __init__(self, venue: Venue, max_group_size: int, min_distance: float):
        self._venue = venue
        self._num_rows = len(venue.rows)
        self._num_seats = venue.num_seats
        self._max_group_size = max_group_size
        self._min_distance = min_distance

        self.slots = self.__compute_slots()
        self.slots_by_size = self.__compute_slots_by_size()
        self.slots_by_seat = self.__compute_slots_by_seat()

        self.distances = self.__compute_distances()

        # given a slot that we wish to occupy, return all other slots that are still available after it
        self.slots_by_safety = self.__compute_slots_by_safety()
        # return true => all accessible slots, false => all slots that do not block or occupy accessible slots
        self.slots_by_accessibility = self.__compute_slots_by_accessibility()

    def __compute_slots(self) -> List[IndexedSlot]:
        slots = []
        for row in self._venue.rows:
            for seat in row.seats:
                for group_size in range(1, self._max_group_size + 1):
                    if seat.seat_n + group_size <= len(row.seats):
                        slots.append(IndexedSlot(row_n=seat.row_n, seat_n=seat.seat_n, size=group_size))
        return slots

    def __compute_slots_by_size(self) -> Dict[int, BitSetIndex]:
        slots_by_size = {}
        for group_size in range(1, self._max_group_size + 1):
            slots_by_size[group_size] = BitSetIndex.from_list([slot.size == group_size for slot in self.slots])
        return slots_by_size

    def __compute_slots_by_seat(self) -> Dict[IndexedSeat, BitSetIndex]:
        slots_by_seat = {}
        for row in self._venue.rows:
            for seat in row.seats:
                slots_by_seat[IndexedSeat(seat.row_n, seat.seat_n)] = BitSetIndex.from_list([
                    slot.row_n == seat.row_n and slot.seat_n <= seat.seat_n < slot.seat_n + slot.size
                    for slot in self.slots
                ])
        return slots_by_seat

    # TODO: replace this by R-Tree efficient spatial index
    def __compute_distances(self) -> Dict[Tuple[int, int], List[Tuple[float, int, int]]]:
        distances = {}
        for row in self._venue.rows:
            for seat in row.seats:
                one_seat_distances = []
                for sub_row in self._venue.rows:
                    for sub_seat in sub_row.seats:
                        if seat.row_n != sub_seat.row_n or seat.seat_n != sub_seat.seat_n:
                            one_seat_distances.append((
                                sqrt((seat.x - sub_seat.x)**2 + (seat.y - sub_seat.y) ** 2),
                                sub_seat.row_n,
                                sub_seat.seat_n
                            ))
                one_seat_distances.sort()
                distances[(seat.row_n, seat.seat_n)] = one_seat_distances
        return distances

    def __compute_slots_by_safety(self) -> List[BitSetIndex]:
        slots_by_safety = []
        for slot_n, slot in enumerate(self.slots):
            impacted_indexes = []
            for seat in self.__seats_to_block(slot):
                impacted_indexes.append(self.slots_by_seat[seat])
            for seat_n in range(slot.seat_n, slot.seat_n + slot.size):
                impacted_indexes.append(self.slots_by_seat[IndexedSeat(row_n=slot.row_n, seat_n=seat_n)])

            index = BitSetIndex.union(impacted_indexes)
            index.inverse()
            slots_by_safety.append(index)

        return slots_by_safety

    def __seats_to_block(self, slot: IndexedSlot) -> List[IndexedSeat]:
        res = []
        for seat_n in range(slot.seat_n, slot.seat_n + slot.size):
            for distance, other_row_n, other_seat_n in takewhile(lambda x: x[0] < self._min_distance,
                                                                 self.distances[(slot.row_n, seat_n)]):
                res.append(IndexedSeat(row_n=other_row_n, seat_n=other_seat_n))
        return res

    def __compute_slots_by_accessibility(self) -> Dict[bool, BitSetIndex]:
        accessible_indices = []
        for row in self._venue.rows:
            for seat in row.seats:
                if seat.accessible:
                    accessible_indices.append(self.slots_by_seat[IndexedSeat(row_n=seat.row_n, seat_n=seat.seat_n)])

        if len(accessible_indices) == 0:
            accessible_index = BitSetIndex(size=len(self.slots), value=0)
            non_accessible_index = BitSetIndex(size=len(self.slots), value=0)
            non_accessible_index.inverse()
        else:
            accessible_index = BitSetIndex.union(accessible_indices)
            non_accessible_index = BitSetIndex.intersect(
                [self.slots_by_safety[slot_n] for slot_n in accessible_index.iterate()])

        return {True: accessible_index, False: non_accessible_index}


class IndexedState(State):

    def __init__(self, empty_index: BitSetIndex, occupied_index: BitSetIndex):
        self.empty_index = empty_index
        self.occupied_index = occupied_index

    def __eq__(self, other: 'IndexedState') -> bool:
        return self.empty_index == other.empty_index and self.occupied_index == other.occupied_index

    def __hash__(self):
        return hash((self.empty_index, self.occupied_index))

    def __repr__(self):
        return repr(self.empty_index) + " | " + repr(self.occupied_index)


class IndexedImplementation(Implementation):

    def __init__(self, venue: Venue, max_group_size: int, min_distance: float, max_expand=10):
        self._venue = venue
        self._max_group_size = max_group_size
        self._min_distance = min_distance
        self._meta_state = MetaState(venue, max_group_size, min_distance)
        self._max_expand = max_expand

    @property
    def max_group_size(self) -> int:
        return self._max_group_size

    def create_initial_state(self) -> IndexedState:
        return IndexedState(empty_index=BitSetIndex.from_list([True] * len(self._meta_state.slots)),
                            occupied_index=BitSetIndex.from_list([False] * len(self._meta_state.slots)))

    def expand(self, state: IndexedState, group: Group) -> List[IndexedState]:
        expanded_states = []

        slots_index_intermediate = BitSetIndex.intersect([
            state.empty_index,
            self._meta_state.slots_by_size[group.size],
        ])

        if group.accessibility:
            slots_index = BitSetIndex.intersect([
                slots_index_intermediate,
                self._meta_state.slots_by_accessibility[True]
            ])
        else:
            slots_index = BitSetIndex.intersect(
                [slots_index_intermediate, self._meta_state.slots_by_accessibility[False]])
            if not slots_index.any():
                slots_index = slots_index_intermediate

        for slot_n in islice(slots_index.iterate(), self._max_expand):
            expanded_states.append(self.__place_group(state, slot_n))
        return expanded_states

    def __place_group(self, prev_state: IndexedState, slot_n: int) -> IndexedState:
        impact_indexes = self._meta_state.slots_by_safety[slot_n]
        empty_index = BitSetIndex.intersect([impact_indexes, prev_state.empty_index])
        occupied_index = prev_state.occupied_index.clone()
        occupied_index.add(slot_n)
        return IndexedState(empty_index, occupied_index)

    def evaluate(self, state: IndexedState, cursor: int) -> int:
        score = 2 * cursor * self._venue.num_seats

        for row in self._venue.rows:
            for seat in row.seats:
                index = self._meta_state.slots_by_seat[IndexedSeat(seat_n=seat.seat_n, row_n=seat.row_n)]
                if BitSetIndex.intersect([index, state.occupied_index]).any():
                    score += 2 * seat.value
                elif BitSetIndex.intersect([index, state.empty_index]).any():
                    score += 1 * seat.value
        return score

    def assign(self, group_queue: List[Group], state: IndexedState) -> Dict[Group, Tuple[int, int]]:
        solution = {}
        group_slots = self.__collect_group_slots(state)
        for group in group_queue:
            assert len(group_slots[group.size]) > 0
            row_n, seat_n = group_slots[group.size].pop(0)
            solution[group] = (row_n, seat_n)
        return solution

    def __collect_group_slots(self, state: IndexedState) -> Dict[int, List[Tuple[int, int]]]:
        result = {group_size: [] for group_size in range(1, self._max_group_size + 1)}

        for slot_n in state.occupied_index.iterate():
            slot = self._meta_state.slots[slot_n]
            result[slot.size].append((slot.row_n, slot.seat_n))

        for group_size, slots in result.items():
            slots.sort(key=lambda seat: seat[0])

        return result

    def repr_state(self, state: IndexedState) -> str:
        # TODO: accessible place
        s = ""
        for row in self._venue.rows:
            for seat in row.seats:
                seat_slots_index = self._meta_state.slots_by_seat[IndexedSeat(seat_n=seat.seat_n, row_n=seat.row_n)]
                if BitSetIndex.intersect([state.occupied_index, seat_slots_index]).any():
                    s += 'o'
                elif BitSetIndex.intersect([state.empty_index, seat_slots_index]).any():
                    s += '.'
                else:
                    s += 'x'
            s += '\n'
        return s
