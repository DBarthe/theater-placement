from collections import Counter

from tragos import GridImplementation, IndexedImplementation
from tragos.impl.grid import GridState, GridSeat
from tragos.impl.indexed import IndexedState, IndexedSeat, BitSetIndex


class PackedGridImplementation(GridImplementation):

    def __init__(self, *args, **kwargs):
        super(PackedGridImplementation, self).__init__(*args, **kwargs)

    def evaluate(self, state: GridState, cursor: int) -> int:
        score = cursor * self._num_seats * self._num_rows
        for row_n, counter in enumerate([Counter(row) for row in state.grid]):
            score += (self._num_rows - row_n) * counter.get(GridSeat.OCCUPIED, 0) + counter.get(GridSeat.EMPTY, 0)
        return score


class PackedIndexedImplementation(IndexedImplementation):

    def __init__(self, *args, **kwargs):
        super(PackedIndexedImplementation, self).__init__(*args, **kwargs)

    def evaluate(self, state: IndexedState, cursor: int) -> int:
        score = cursor * self._num_seats * self._num_rows

        for row_n in range(self._num_rows):
            for seat_n in range(self._row_size):
                index = self._meta_state.slots_by_seat[IndexedSeat(seat_n=seat_n, row_n=row_n)]
                if BitSetIndex.intersect([index, state.occupied_index]).any():
                    score += self._num_rows - row_n
                elif BitSetIndex.intersect([index, state.empty_index]).any():
                    score += 1
        return score
