import argparse
import heapq
import itertools
from copy import deepcopy
from itertools import islice, takewhile
from math import sqrt
from typing import NamedTuple, List, Dict, Generator, Tuple, cast, Optional

from tragos.fake import create_venue, create_requirements
from tragos.models import Group, Requirements, Solution, SeatSolution, SeatStatus, Slot
from tragos.models import Venue


class State:

    def __eq__(self, other):
        raise NotImplementedError

    def __hash__(self):
        raise NotImplementedError

    def __repr__(self):
        raise NotImplementedError


class Fringe:
    def __init__(self):
        self._heap = []
        self._counter = itertools.count()

    def push(self, state: State, cursor: int, score: float):
        # heapq.heappush(self._heap, (-cursor, -score, next(self._counter), state))
        heapq.heappush(self._heap, (-score, -cursor, next(self._counter), state))

    def pop(self) -> Tuple[State, int]:
        # minus_cursor, minus_score, counter, state = heapq.heappop(self._heap)
        minus_score, minus_cursor, counter, state = heapq.heappop(self._heap)
        return state, -minus_cursor

    def peek(self) -> Tuple[State, int]:
        # minus_cursor, minus_score, counter, state = self._heap[0]
        minus_score, minus_cursor, counter, state = self._heap[0]
        return state, -minus_cursor

    def find(self, cursor) -> Tuple[State, int]:
        return next((state, -minus_cursor)
                    # for minus_cursor, minus_score, counter, state in self._heap
                    for minus_score, minus_cursor, counter, state in self._heap
                    if -minus_cursor == cursor)

    def __len__(self) -> int:
        return len(self._heap)


class ClosedSet:

    def __init__(self):
        self._set = set([])

    def put(self, state: State):
        self._set.add(state)

    def contains(self, state: State) -> bool:
        return state in self._set

    def __len__(self) -> int:
        return len(self._set)


class Implementation:

    def create_initial_state(self) -> State:
        raise NotImplementedError

    def expand(self, state: State, group: Group) -> List[State]:
        raise NotImplementedError

    # list slots, dict group_n -> slot_n
    def assign(self, group_queue: List[Group], state: State) -> Tuple[List[Slot], Dict[int, int]]:
        raise NotImplementedError

    def evaluate(self, state: State, cursor: int) -> float:
        raise NotImplementedError

    def as_grid(self, state: State) -> List[List[SeatSolution]]:
        raise NotImplementedError


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

    def __init__(self, venue: Venue, requirements: Requirements):
        self._venue = venue
        self._num_rows = len(venue.rows)
        self._num_seats = venue.num_seats
        self._max_group_size = requirements.max_group_size
        self._min_distance = requirements.min_distance

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
                                sqrt((seat.x - sub_seat.x) ** 2 + (seat.y - sub_seat.y) ** 2),
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

    def __init__(self, venue: Venue, requirements: Requirements, max_expand=10):
        self._venue = venue
        self._requirements = requirements
        self._meta_state = MetaState(venue, requirements)
        self._max_expand = max_expand

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

    def assign(self, group_queue: List[Group], state: IndexedState) -> Tuple[List[Slot], Dict[int, int]]:
        slots = []
        assignments = {}
        group_slots = self.__collect_group_slots(state)
        for group in group_queue:
            assert len(group_slots[group.size]) > 0
            row_n, seat_n = group_slots[group.size].pop(0)
            slot = Slot(
                row_n=row_n,
                seat_n=seat_n,
                size=group.size,
                seats=[self._venue.rows[row_n].seats[seat_n + i] for i in range(group.size)]
            )
            slots.append(slot)
            assignments[group.group_n] = len(slots) - 1
        return slots, assignments

    def __collect_group_slots(self, state: IndexedState) -> Dict[int, List[Tuple[int, int]]]:
        result = {group_size: [] for group_size in range(1, self._requirements.max_group_size + 1)}

        for slot_n in state.occupied_index.iterate():
            slot = self._meta_state.slots[slot_n]
            result[slot.size].append((slot.row_n, slot.seat_n))

        for group_size, slots in result.items():
            slots.sort(key=lambda seat: seat[0])

        return result

    def as_grid(self, state: IndexedState) -> List[List[SeatSolution]]:
        grid = []
        for row in self._venue.rows:
            grid_row = []
            for seat in row.seats:
                seat_slots_index = self._meta_state.slots_by_seat[IndexedSeat(seat_n=seat.seat_n, row_n=seat.row_n)]
                if BitSetIndex.intersect([state.occupied_index, seat_slots_index]).any():
                    grid_row.append(SeatSolution(status=SeatStatus.OCCUPIED))
                elif BitSetIndex.intersect([state.empty_index, seat_slots_index]).any():
                    grid_row.append(SeatSolution(status=SeatStatus.EMPTY))
                else:
                    grid_row.append(SeatSolution(status=SeatStatus.BLOCKED))
            grid.append(grid_row)
        return grid


class Manager:

    def __init__(self, impl: Implementation, requirements: Requirements, max_loop=None):
        self._impl = impl
        self._group_queue = []
        self._declined_groups = []
        self._requirements = requirements
        self._fringe = Fringe()
        initial_state = impl.create_initial_state()
        self._fringe.push(initial_state, 0, impl.evaluate(initial_state, 0))
        self._closed_set = ClosedSet()

        # TODO: replace with a timeout
        self._max_loop = max_loop

        self._backup = None

    def run(self) -> Solution:
        # loop
        print("Starting placement loop")
        for group in self._requirements.group_queue:
            print("Trying to place group {}".format(group))
            self.__save()
            self._group_queue.append(group)
            success = self.__do_place(max_loop=self._max_loop)
            if not success:
                print("Failed to place group {}... skipping".format(group))
                del self._group_queue[-1]
                self.__restore()
                self._declined_groups.append(group)
            else:
                print("Succeed to place group {}".format(group))
                print(self.__print_state(self._fringe.find(cursor=len(self._group_queue))[0]))
                print("{} seats occupied".format(sum((group.size for group in self._group_queue))))
                print("{} groups placed".format(len(self._group_queue)))

        return self.__build_solution()

    def __print_state(self, state: State):
        grid = self._impl.as_grid(state)
        # TODO: accessible place
        s = ""
        for row in grid:
            for seat_solution in row:
                if seat_solution.status == SeatStatus.OCCUPIED:
                    s += 'o'
                elif seat_solution.status == SeatStatus.EMPTY:
                    s += '.'
                else:
                    s += 'x'
            s += '\n'
        return s

    def __do_place(self, max_loop=None) -> bool:
        i = 0
        while len(self._fringe) > 0:

            if max_loop is not None and i >= max_loop:
                print("Timeout after {} iterations".format(i))
                return False
            i += 1

            # print("Fringe size = {} / ClosedSet size = {}".format(len(self._fringe), len(self._closed_set)))
            state, cursor = self._fringe.pop()
            expanded_states = self._impl.expand(state, self._group_queue[cursor])

            for expanded_state in expanded_states:
                self._fringe.push(expanded_state, cursor + 1, self._impl.evaluate(expanded_state, cursor + 1))
                self._closed_set.put(expanded_state)

            if len(expanded_states) > 0 and cursor + 1 == len(self._group_queue):
                return True

        return False

    def __build_solution(self) -> Solution:
        final_state, _ = self._fringe.find(cursor=len(self._group_queue))
        slots, assignments_dict = self._impl.assign(self._group_queue, final_state)
        assignments_dict = cast(Dict[int, Optional[int]], assignments_dict)
        grid = self._impl.as_grid(final_state)

        for group_n, slot_n in assignments_dict.items():
            slot = slots[slot_n]
            for seat in slot.seats:
                seat_solution = grid[seat.row_n][seat.seat_n]
                seat_solution.group_n = group_n
                seat_solution.slot_n = slot_n

        assignments = [
            assignments_dict[group.group_n] if group.group_n in assignments_dict else None
            for group in self._requirements.group_queue
        ]

        solution = Solution(
            success=len(self._declined_groups) == 0,
            num_groups_placed=len(self._group_queue),
            num_groups_declined=len(self._declined_groups),

            # TODO: can be optimized
            num_seats_occupied=sum((group.size for group in self._group_queue)),
            num_seats_blocked=sum((sum(seat.status == SeatStatus.BLOCKED for seat in row) for row in grid)),
            num_seats_empty=sum((sum(seat.status == SeatStatus.EMPTY for seat in row) for row in grid)),

            # TODO: compute covid score
            covid_score=1,

            slots=slots,
            assignments=assignments,
            grid=grid
        )

        return solution

    def __save(self):
        self._backup = (deepcopy(self._fringe), deepcopy(self._closed_set))

    def __restore(self):
        self._fringe, self._closed_set = self._backup


def start(venue: Venue, requirements: Requirements, max_expand=10, max_loop=50) -> Solution:
    impl = IndexedImplementation(
        venue=venue,
        requirements=Requirements(),
        max_expand=max_expand,
    )

    manager = Manager(impl, requirements, max_loop=max_loop)
    return manager.run()


def print_solution(r: Requirements, s: Solution):
    print("===== Solution =====")

    print("success = {}".format(s.success))
    print("num_groups_placed = {}".format(s.num_groups_placed))
    print("num_groups_declined = {}".format(s.num_groups_declined))
    print("num_seats_occupied = {}".format(s.num_seats_occupied))
    print("num_seats_blocked = {}".format(s.num_seats_blocked))
    print("num_seats_empty = {}".format(s.num_seats_empty))
    print("covid_score = {}".format(s.covid_score))

    grid_str = "grid = \n"
    for row_n, row in enumerate(s.grid):
        grid_str += "  {:2d}| ".format(row_n)
        for seat_s in row:
            if seat_s.status == SeatStatus.EMPTY:
                grid_str += '.'
            elif seat_s.status == SeatStatus.BLOCKED:
                grid_str += 'x'
            else:
                grid_str += 'o'
        grid_str += '\n'
    print(grid_str)

    print("assignments =\n")
    for group_n, slot_n in enumerate(s.assignments):
        group = r.group_queue[group_n]
        slot = s.slots[slot_n] if slot_n is not None else None
        group_str = "group {} size={}".format(group.group_n, group.size)
        if slot is not None:
            slot_str = "row_n={} seat_n={} size={}".format(slot.row_n, slot.seat_n, slot.size)
        else:
            slot_str = "None"
        print("    {} -> {}".format(group_str, slot_str))

    print("====================")


def main(argv=None):
    parser = argparse.ArgumentParser(description='COVID-friendly theater placement')
    parser.add_argument('--min-distance', dest='min_distance', type=float, default=1.5,
                        help='the min distance to keep between people')
    parser.add_argument('--max-expand', dest='max_expand', type=int, default=10, help='the max expansion factor')
    parser.add_argument('--num-groups', dest='num_groups', type=int, default=10,
                        help='the number of groups to generate')
    parser.add_argument('--max-loop', dest='max_loop', type=int, default=50,
                        help='the max number of iteration when searching')

    args = parser.parse_args(argv)

    requirements = create_requirements(num_groups=args.num_groups, min_distance=args.min_distance)
    solution = start(venue=create_venue(),
                     requirements=requirements,
                     max_expand=args.max_expand, max_loop=args.max_loop)

    print_solution(requirements, solution)


if __name__ == '__main__':
    main()
