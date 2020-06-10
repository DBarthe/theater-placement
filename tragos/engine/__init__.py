import argparse

from tragos.engine.core import Manager
from tragos.engine.grid_impl import GridImplementation
from tragos.engine.indexed_impl import IndexedImplementation


def main(argv=None):
    parser = argparse.ArgumentParser(description='COVID-friendly theater placement')
    parser.add_argument('num_rows', type=int, help='the number of rows')
    parser.add_argument('row_size', type=int, help='the size of a row')
    parser.add_argument('max_group_size', type=int, help='the maximum size of a group')
    parser.add_argument('--max-expand', dest='max_expand', type=int, default=10, help='the max expansion factor')
    parser.add_argument('--max-num-groups', dest='max_num_groups', type=int, default=None,
                        help='the max number of groups (default unlimited)')
    parser.add_argument('--max-loop', dest='max_loop', type=int, default=50,
                        help='the max number of iteration when searching')

    args = parser.parse_args(argv)

    impl = IndexedImplementation(
        num_rows=args.num_rows,
        row_size=args.row_size,
        max_group_size=args.max_group_size,
        accessibility_rows={0, 1},
        max_expand=args.max_expand,
    )

    manager = Manager(impl, max_num_groups=args.max_num_groups, max_loop=args.max_loop)
    manager.run()


if __name__ == '__main__':
    main(["10", "10", "5"])
