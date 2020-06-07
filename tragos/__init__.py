from tragos.impl.grid import GridImplementation
from tragos.core import Manager
from tragos.impl.indexed import IndexedImplementation
from tragos.impl.packed import PackedGridImplementation, PackedIndexedImplementation


def main():
    impl = PackedIndexedImplementation(num_rows=30, row_size=30, max_group_size=6)
    manager = Manager(impl)
    manager.run()


if __name__ == '__main__':
    main()
