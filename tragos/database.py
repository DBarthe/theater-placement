from typing import Union

import ZODB.Connection
import ZODB.FileStorage
from ZODB.BaseStorage import BaseStorage

from tragos import Config
from tragos.models import TragosData, Venue


class DatabaseManager:

    def __init__(self, storage: Union[str, None, BaseStorage] = None):
        self.db = ZODB.DB(storage)

    def load_initial_data(self):
        with self.create_transaction() as co:
            if 'tragos' not in co.root():
                co.root.tragos = TragosData()
                co.root.tragos.venues.insert("1", Venue(uid="1"))

    def create_connection(self) -> ZODB.Connection:
        return self.db.open()

    def create_transaction(self) -> ZODB.Connection:
        return self.db.transaction()

    @staticmethod
    def from_config():
        storage = Config.DATABASE_FILE
        if storage == "":
            storage = None
        return DatabaseManager(storage)
