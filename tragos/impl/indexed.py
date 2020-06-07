from itertools import islice
from typing import NamedTuple, List, Dict, Generator, Tuple

from tragos.core import State, Implementation, Group
from tragos.impl.grid import GridState, GridSeat


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
        self._value = ~self._value

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


class MetaState:

    def __init__(self, num_rows: int, row_size: int, max_group_size: int):
        self._num_rows = num_rows
        self._row_size = row_size
        self._num_seats = num_rows * row_size
        self._max_group_size = max_group_size
        self.slots = self.__compute_slots()
        self.slots_by_size = self.__compute_slots_by_size()
        self.slots_by_seat = self.__compute_slots_by_seat()

        # given a slot, return all slots that have no connection
        self.slots_by_safety = self.__compute_slots_by_safety()

    def __compute_slots(self) -> List[IndexedSlot]:
        slots = []
        for row_n in range(self._num_rows):
            for seat_n in range(self._row_size):
                for group_size in range(1, self._max_group_size + 1):
                    if seat_n + group_size <= self._row_size:
                        slots.append(IndexedSlot(row_n=row_n, seat_n=seat_n, size=group_size))
        return slots

    def __compute_slots_by_size(self) -> Dict[int, BitSetIndex]:
        slots_by_size = {}
        for group_size in range(1, self._max_group_size + 1):
            slots_by_size[group_size] = BitSetIndex.from_list([slot.size == group_size for slot in self.slots])
        return slots_by_size

    def __compute_slots_by_seat(self) -> Dict[IndexedSeat, BitSetIndex]:
        slots_by_seat = {}
        for row_n in range(self._num_rows):
            for seat_n in range(self._row_size):
                slots_by_seat[IndexedSeat(row_n, seat_n)] = BitSetIndex.from_list([
                    slot.row_n == row_n and slot.seat_n <= seat_n < slot.seat_n + slot.size
                    for slot in self.slots
                ])
        return slots_by_seat

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
            # index.remove(slot_n)
            slots_by_safety.append(index)

        return slots_by_safety

    def __seats_to_block(self, slot: IndexedSlot) -> List[IndexedSeat]:
        res = []

        if slot.seat_n > 0:
            res.append(IndexedSeat(row_n=slot.row_n, seat_n=slot.seat_n - 1))

        # block right side
        if slot.seat_n + slot.size < self._row_size:
            res.append(IndexedSeat(row_n=slot.row_n, seat_n=slot.seat_n + slot.size))

        # block front side
        if slot.row_n > 0:
            for i in range(slot.size):
                res.append(IndexedSeat(row_n=slot.row_n - 1, seat_n=slot.seat_n + i))

        # block back side
        if slot.row_n + 1 < self._num_rows:
            for i in range(slot.size):
                res.append(IndexedSeat(row_n=slot.row_n + 1, seat_n=slot.seat_n + i))

        return res


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

    def __init__(self, num_rows=5, row_size=5, max_group_size=5):
        self._num_rows = num_rows
        self._row_size = row_size
        self._max_group_size = max_group_size
        self._num_seats = num_rows * row_size
        self._meta_state = MetaState(num_rows, row_size, max_group_size)

    @property
    def max_group_size(self) -> int:
        return self._max_group_size

    def create_initial_state(self) -> IndexedState:
        return IndexedState(empty_index=BitSetIndex.from_list([True] * len(self._meta_state.slots)),
                            occupied_index=BitSetIndex.from_list([False] * len(self._meta_state.slots)))

    def expand(self, state: IndexedState, group: Group) -> List[IndexedState]:
        expanded_states = []
        slots_index = BitSetIndex.intersect([
            state.empty_index,
            self._meta_state.slots_by_size[group.size]
        ])
        for slot_n in islice(slots_index.iterate(), 10):
            expanded_states.append(self.__place_group(state, slot_n))
        return expanded_states

    def __place_group(self, prev_state: IndexedState, slot_n: int) -> IndexedState:
        impact_indexes = self._meta_state.slots_by_safety[slot_n]
        empty_index = BitSetIndex.intersect([impact_indexes, prev_state.empty_index])
        occupied_index = prev_state.occupied_index.clone()
        occupied_index.add(slot_n)
        return IndexedState(empty_index, occupied_index)

    def evaluate(self, state: IndexedState, cursor: int) -> int:
        score = int(cursor * self._num_seats * self._num_rows * self._max_group_size * (self._max_group_size + 1) / 2)
        for slot_n in state.occupied_index.iterate():
            slot = self._meta_state.slots[slot_n]
            score += (self._num_rows - slot.row_n) * slot.size

        for slot_n in state.empty_index.iterate():
            slot = self._meta_state.slots[slot_n]
            score += slot.size

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
        return repr(self.__convert_state(state))

    def __convert_seat(self, state, row_n, seat_n) -> GridSeat:
        seat_slots_index = self._meta_state.slots_by_seat[IndexedSeat(seat_n=seat_n, row_n=row_n)]
        if BitSetIndex.intersect([state.occupied_index, seat_slots_index]).any():
            return GridSeat.OCCUPIED
        elif BitSetIndex.intersect([state.empty_index, seat_slots_index]).any():
            return GridSeat.EMPTY
        else:
            return GridSeat.BLOCKED

    def __convert_state(self, state: IndexedState) -> GridState:
        return GridState([[
            self.__convert_seat(state, row_n, seat_n)
            for seat_n in range(self._row_size)]
            for row_n in range(self._num_rows)
        ])

