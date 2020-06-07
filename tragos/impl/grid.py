import enum
import itertools
from collections import Counter
from copy import deepcopy
from typing import List, Dict, Tuple

from tragos.core import State, Implementation, Group


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


class GridImplementation(Implementation):

    def __init__(self, num_rows=5, row_size=5, max_group_size=5):
        self._num_rows = num_rows
        self._row_size = row_size
        self._max_group_size = max_group_size
        self._num_seats = num_rows * row_size

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
        score = cursor * self._num_seats + counter.get(BasicSeat.OCCUPIED, 0) + counter.get(BasicSeat.EMPTY, 0)

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
