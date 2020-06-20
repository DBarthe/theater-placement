import pymongo
from pymongo import MongoClient

from tragos import Config


class DatabaseManager:

    def __init__(self, url: str, name: str):
        self.client = MongoClient(url)
        self.db = self.client[name]

    def events(self) -> pymongo.collection.Collection:
        return self.db['events']

    def venues(self) -> pymongo.collection.Collection:
        return self.db['venues']

    @staticmethod
    def from_config():
        return DatabaseManager(Config.DATABASE_URL, Config.DATABASE_NAME)


if __name__ == '__main__':
    db_manager = DatabaseManager.from_config()
