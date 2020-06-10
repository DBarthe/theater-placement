from dataclasses import dataclass


@dataclass
class Group:
    name: str
    size: int
    accessibility: bool = False

    def __eq__(self, other):
        return isinstance(other, Group) and self.name == other.name

    def __hash__(self):
        return hash(self.name)

    def __repr__(self) -> str:
        s = "{} of {} pers".format(self.name, self.size)
        if self.accessibility:
            s += " with accessibility"
        return s
