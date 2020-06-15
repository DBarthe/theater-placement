from typing import Union

from ZODB.BaseStorage import BaseStorage
import ZODB.FileStorage
import ZODB.Connection

import persistent
import transaction

from tragos import Config


class DatabaseManager:

    def __init__(self, storage: Union[str, None, BaseStorage] = None):
        self.db = ZODB.DB(storage)

    def create_connection(self) -> ZODB.Connection:
        return self.db.open()

    @staticmethod
    def from_config():
        storage = Config.DATABASE_FILE
        if storage == "":
            storage = None
        return DatabaseManager(storage)


if __name__ == '__main__':
    class Toto(persistent.Persistent):
        def __init__(self):
            self.x = 42

        def __repr__(self):
            return str(self.x)


    manager = DatabaseManager("test.db")
    co = manager.create_connection()
    toto = Toto()
    co.root.toto = toto
    print(co.root.toto)
    toto.x = 21
    transaction.commit()
