import argparse

from tragos.core import Manager
from tragos.impl.grid import GridImplementation
from tragos.impl.indexed import IndexedImplementation
from tragos.impl.packed import PackedGridImplementation, PackedIndexedImplementation


def main():
    parser = argparse.ArgumentParser(description='COVID-friendly theater placement')
    parser.add_argument('num_rows', type=int, help='the number of rows')
    parser.add_argument('row_size', type=int, help='the size of a row')
    parser.add_argument('max_group_size', type=int, help='the maximum size of a group')

    args = parser.parse_args()

    impl = PackedIndexedImplementation(
        num_rows=args.num_rows,
        row_size=args.row_size,
        max_group_size=args.max_group_size)
    manager = Manager(impl)
    manager.run()


if __name__ == '__main__':
    main()
