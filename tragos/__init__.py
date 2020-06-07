from tragos.basic import BasicImplementation
from tragos.core import Manager


def main():
    impl = BasicImplementation(num_rows=15, row_size=20, max_group_size=6)
    manager = Manager(impl)
    manager.run()
