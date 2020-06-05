from typing import List, Generator


class State:

    @property
    def size(self) -> int:
        raise NotImplementedError

    def __eq__(self, other):
        raise NotImplementedError

    def __hash__(self):
        raise NotImplementedError


class Score:

    @property
    def value(self) -> int:
        raise NotImplementedError


class Group:

    @property
    def size(self) -> int:
        raise NotImplementedError


class Fringe:

    def put(self, state: State, cursor: int):
        raise NotImplementedError

    def get(self) -> (State, int):
        raise NotImplementedError

    def __len__(self) -> int:
        raise NotImplementedError


class ClosedSet:

    def put(self, state: State):
        raise NotImplementedError

    def contains(self, state: State) -> bool:
        raise NotImplementedError


class GroupQueue:

    def put(self, group: Group):
        raise NotImplementedError

    def get(self, index: int) -> Group:
        raise NotImplementedError

    def size(self) -> int:
        raise NotImplementedError


class Solution:
    pass


class Implementation:

    @property
    def max_group_size(self) -> int:
        raise NotImplementedError

    def create_initial_state(self) -> State:
        raise NotImplementedError

    def evaluate(self, state: State) -> Score:
        raise NotImplementedError

    def expand(self, state: State, group: Group) -> List[State]:
        raise NotImplementedError

    def assign(self, group_queue : GroupQueue, state: State) -> Solution:
        raise NotImplementedError


class Manager:

    def __init__(self, impl: Implementation):
        self.impl = impl
        self.group_queue = GroupQueue()
        self.fringe = Fringe()
        self.fringe.put(impl.create_initial_state(), 0)
        self.closed_set = ClosedSet()
        self.max_group_size = impl.max_group_size

    def run(self):
        # loop
        for group in self.next_group():
            self.save()
            self.group_queue.put(group)
            success = self.do_place()
            self.send_result(success)
            if not success:
                self.restore()
                self.max_group_size = group.size - 1

        final_state, _ = self.fringe.get()
        solution = self.impl.assign(self.group_queue, final_state)
        self.send_solution(solution)

    def do_place(self) -> bool:
        while len(self.fringe) > 0:
            state, cursor = self.fringe.get()
            expanded_states = self.impl.expand(state, self.group_queue.get(cursor))

            for expanded_state in expanded_states:
                self.fringe.put(expanded_state, cursor + 1)
                self.closed_set.put(expanded_state)

            if len(expanded_states) > 0:
                return True

        return False

    def save(self):
        raise NotImplementedError

    def restore(self):
        raise NotImplementedError

    def next_group(self) -> Generator[Group, None, None]:
        while self.max_group_size > 0:
            raise NotImplementedError

    def send_result(self, success: bool):
        raise NotImplementedError

    def send_solution(self, solution: Solution):
        raise NotImplementedError


def main():
    impl = Implementation()
    manager = Manager(impl)
    manager.run()


if __name__ == "__main__":
    main()
