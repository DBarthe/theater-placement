import enum
import heapq
import itertools
import random
from collections import Counter
from copy import deepcopy
from typing import List, Generator, Dict, Tuple


class State:

    def __eq__(self, other):
        raise NotImplementedError

    def __hash__(self):
        raise NotImplementedError

    def __repr__(self):
        raise NotImplementedError


class Group:

    def __init__(self, name: str, size: int):
        self._name = name
        self._size = size

    @property
    def name(self) -> str:
        return self._name

    @property
    def size(self) -> int:
        return self._size


class Fringe:
    def __init__(self):
        self._heap = []
        self._counter = itertools.count()

    def push(self, state: State, cursor: int, score: int):
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

    @property
    def max_group_size(self) -> int:
        raise NotImplementedError

    def create_initial_state(self) -> State:
        raise NotImplementedError

    def expand(self, state: State, group: Group) -> List[State]:
        raise NotImplementedError

    def assign(self, group_queue: List[Group], state: State) -> Dict[Group, Tuple[int, int]]:
        raise NotImplementedError

    def evaluate(self, state: State, cursor: int) -> int:
        raise NotImplementedError


class BasicSeat(enum.Enum):
    EMPTY = 0
    OCCUPIED = 1
    BLOCKED = 2
    # TODO: reserved seats
    # TODO: seats that are permanently closed for other purpose than covid safety


class BasicState(State):

    def __init__(self, grid):
        self.grid = grid
        self._compact = None

    def __eq__(self, other: 'BasicState') -> bool:
        return self.compact == other.compact

    def __hash__(self) -> int:
        return hash(self._compact)

    def __repr__(self):
        res = ""
        for row in self.grid:
            for seat in row:
                if seat == BasicSeat.EMPTY:
                    res += "."
                elif seat == BasicSeat.OCCUPIED:
                    res += "o"
                elif seat == BasicSeat.BLOCKED:
                    res += "x"
            res += "\n"
        return res

    @property
    def compact(self) -> int:
        if self._compact is None:
            self._compact = self.__compute_compact()
        return self._compact

    def __compute_compact(self) -> int:
        res = 0
        for seat in itertools.chain.from_iterable(self.grid):
            res = (res << 2) + seat.value
        return res


class BasicImplementation(Implementation):

    def __init__(self, num_rows=5, row_size=5, max_group_size=5):
        self._num_rows = num_rows
        self._row_size = row_size
        self._max_group_size = max_group_size

    @property
    def max_group_size(self) -> int:
        return self._max_group_size

    def create_initial_state(self) -> BasicState:
        grid = [[BasicSeat.EMPTY for seat_n in range(self._row_size)] for row_n in range(self._num_rows)]
        return BasicState(grid)

    def expand(self, state: BasicState, group: Group) -> List[BasicState]:
        result = []
        for row_n, row in enumerate(state.grid):
            for seat_n in range(len(row)):
                if row[seat_n:seat_n + group.size] == [BasicSeat.EMPTY] * group.size:
                    cloned_state = self.__clone_state(state)
                    self.__place_group(cloned_state, group, row_n, seat_n)
                    result.append(cloned_state)
        return result

    def evaluate(self, state: BasicState, cursor: int) -> int:
        counter = Counter(itertools.chain.from_iterable(state.grid))
        # score = counter.get(BasicSeat.EMPTY, 0) + counter.get(BasicSeat.OCCUPIED, 0) - counter.get(BasicSeat.BLOCKED, 0)
        # score = counter.get(BasicSeat.OCCUPIED, 0) / counter.get(BasicSeat.BLOCKED, 1)
        score = cursor * self._row_size * self._num_rows + counter.get(BasicSeat.OCCUPIED, 0) + counter.get(BasicSeat.EMPTY, 0)

        return score

    def assign(self, group_queue: List[Group], state: BasicState) -> Dict[Group, Tuple[int, int]]:
        solution = {}
        group_slots = self.__collect_group_slots(state)
        for group in group_queue:
            assert len(group_slots[group.size]) > 0
            row_n, seat_n = group_slots[group.size].pop(0)
            solution[group] = (row_n, seat_n)
        return solution

    def __clone_state(self, state: BasicState) -> BasicState:
        return BasicState(deepcopy(state.grid))

    def __place_group(self, state, group, row_n, seat_n):
        assert seat_n + group.size <= self._row_size
        for i in range(group.size):
            assert state.grid[row_n][seat_n + i] == BasicSeat.EMPTY
            state.grid[row_n][seat_n + i] = BasicSeat.OCCUPIED

        # TODO: variable distance rule
        # block left side
        if seat_n > 0:
            assert state.grid[row_n][seat_n - 1] != BasicSeat.OCCUPIED
            state.grid[row_n][seat_n - 1] = BasicSeat.BLOCKED

        # block right side
        if seat_n + group.size < self._row_size:
            assert state.grid[row_n][seat_n + group.size] != BasicSeat.OCCUPIED
            state.grid[row_n][seat_n + group.size] = BasicSeat.BLOCKED

        # block front side
        if row_n > 0:
            for i in range(group.size):
                assert state.grid[row_n - 1][seat_n + i] != BasicSeat.OCCUPIED
                state.grid[row_n - 1][seat_n + i] = BasicSeat.BLOCKED

        # block back side
        if row_n + 1 < self._num_rows:
            for i in range(group.size):
                assert state.grid[row_n + 1][seat_n + i] != BasicSeat.OCCUPIED
                state.grid[row_n + 1][seat_n + i] = BasicSeat.BLOCKED

    def __collect_group_slots(self, state: BasicState) -> Dict[int, List[Tuple[int, int]]]:
        result = {group_size: [] for group_size in range(1, self._max_group_size + 1)}
        for row_n, row in enumerate(state.grid):
            seat_n = 0
            while seat_n < self._row_size:
                if row[seat_n] == BasicSeat.OCCUPIED:
                    group_size = self.__count_group_size(row, seat_n)
                    result[group_size].append((row_n, seat_n))
                    seat_n += group_size
                else:
                    seat_n += 1
        return result

    def __count_group_size(self, row: List[int], seat_n):
        size = 0
        while seat_n + size < self._row_size and row[seat_n + size] == BasicSeat.OCCUPIED:
            size += 1
        return size


class Manager:

    def __init__(self, impl: Implementation):
        self._impl = impl
        self._group_queue = []
        self._fringe = Fringe()
        initial_state = impl.create_initial_state()
        self._fringe.push(initial_state, 0, impl.evaluate(initial_state, 0))
        self._closed_set = ClosedSet()
        self._max_group_size = impl.max_group_size

        self._backup = None

    def run(self):
        # loop
        print("Starting placement loop")
        for group in self.next_group():
            print("Trying to place group {} of {} pers".format(group.name, group.size))
            self.save()
            self._group_queue.append(group)
            success = self.do_place(max_loop=50)
            if not success:
                print("Failed to place group {} of {} pers".format(group.name, group.size))
                del self._group_queue[-1]
                self.restore()
                self._max_group_size = group.size - 1
            else:
                print("Succeed to place group {} of {} pers".format(group.name, group.size))
                print(self._fringe.find(cursor=len(self._group_queue))[0])
                print("{} seats occupied".format(sum((group.size for group in self._group_queue))))
                print("{} groups placed".format(len(self._group_queue)))

        final_state, _ = self._fringe.find(cursor=len(self._group_queue))
        solution = self._impl.assign(self._group_queue, final_state)
        print("A solution has been found")
        print(final_state)
        print("{} seats occupied".format(sum((group.size for group in self._group_queue))))
        print("{} groups placed".format(len(self._group_queue)))
        for group, (row_n, seat_n) in solution.items():
            print("Group {} of {} pers -> row {} seat {}".format(group.name, group.size, row_n, seat_n))

    def do_place(self, max_loop=None) -> bool:
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

    def save(self):
        self._backup = (deepcopy(self._fringe), deepcopy(self._closed_set))

    def restore(self):
        self._fringe, self._closed_set = self._backup

    def next_group(self) -> Generator[Group, None, None]:
        group_id = 1
        while self._max_group_size > 0:
            yield Group(str(group_id), random.randint(1, self._max_group_size))
            group_id += 1


def main():
    impl = BasicImplementation(num_rows=15, row_size=20, max_group_size=6)
    manager = Manager(impl)
    manager.run()


if __name__ == "__main__":
    main()
