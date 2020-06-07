from tragos.impl.grid import GridImplementation
from tragos.core import Manager
from tragos.impl.packed import PackedImplementation


def main():
    impl = PackedImplementation(num_rows=15, row_size=20, max_group_size=6)
    manager = Manager(impl)
    manager.run()


if __name__ == '__main__':
    main()
