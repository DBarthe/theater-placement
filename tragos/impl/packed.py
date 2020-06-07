import itertools
from collections import Counter

from tragos import GridImplementation
from tragos.impl.grid import BasicState, BasicSeat


class PackedImplementation(GridImplementation):

    def __init__(self, *args, **kwargs):
        super(PackedImplementation, self).__init__(*args, **kwargs)

    def evaluate(self, state: BasicState, cursor: int) -> int:
        score = cursor * self._num_seats * self._num_rows
        for row_n, counter in enumerate([Counter(row) for row in state.grid]):
            score += (self._num_rows - row_n) * counter.get(BasicSeat.OCCUPIED, 0) + counter.get(BasicSeat.EMPTY, 0)
        return score
