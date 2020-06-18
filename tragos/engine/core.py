import heapq
import itertools
import random
from copy import deepcopy
from typing import List, Generator, Dict, Tuple

from tragos.models import Group


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

    @property
    def max_group_size(self) -> int:
        raise NotImplementedError

    def create_initial_state(self) -> State:
        raise NotImplementedError

    def expand(self, state: State, group: Group) -> List[State]:
        raise NotImplementedError

    def assign(self, group_queue: List[Group], state: State) -> Dict[Group, Tuple[int, int]]:
        raise NotImplementedError

    def evaluate(self, state: State, cursor: int) -> float:
        raise NotImplementedError

    def repr_state(self, state: State) -> str:
        raise NotImplementedError


class Manager:

    def __init__(self, impl: Implementation, max_num_groups=None, max_loop=None):
        self._impl = impl
        self._group_queue = []
        self._max_num_groups = max_num_groups
        self._fringe = Fringe()
        initial_state = impl.create_initial_state()
        self._fringe.push(initial_state, 0, impl.evaluate(initial_state, 0))
        self._closed_set = ClosedSet()
        self._max_group_size = impl.max_group_size

        # TODO: replace with a timeout
        self._max_loop = max_loop

        self._backup = None

    def run(self):
        # loop
        print("Starting placement loop")
        for group in self.next_group():
            print("Trying to place group {}".format(group))
            self.save()
            self._group_queue.append(group)
            success = self.do_place(max_loop=self._max_loop)
            if not success:
                print("Failed to place group {}".format(group))
                del self._group_queue[-1]
                self.restore()
                # FIXME: decrementing max_group_size is broken since accessibility was added
                self._max_group_size = group.size - 1
            else:
                print("Succeed to place group {}".format(group))
                print(self._impl.repr_state(self._fringe.find(cursor=len(self._group_queue))[0]))
                print("{} seats occupied".format(sum((group.size for group in self._group_queue))))
                print("{} groups placed".format(len(self._group_queue)))
                if self._max_num_groups is not None and len(self._group_queue) >= self._max_num_groups:
                    print("Reached maximum number of groups {}".format(self._max_num_groups))
                    break

        final_state, _ = self._fringe.find(cursor=len(self._group_queue))
        solution = self._impl.assign(self._group_queue, final_state)
        print("A solution has been found")
        print(self._impl.repr_state(final_state))
        print("{} seats occupied".format(sum((group.size for group in self._group_queue))))
        print("{} groups placed".format(len(self._group_queue)))
        for group, (row_n, seat_n) in solution.items():
            print("Group {} -> row {} seat {}".format(group, row_n, seat_n))

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
        # for g in [2, 1, 2]:
        #     yield Group(str(group_id), g)
        #     group_id += 1
        # return
        while self._max_group_size > 0:
            yield Group(
                name=str(group_id),
                size=random.randint(1, self._max_group_size),
                accessibility=random.randint(1, 10) == 1)
            group_id += 1
