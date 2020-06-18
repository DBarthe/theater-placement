from dataclasses import asdict

import pymongo
from pymongo import MongoClient

from tragos import Config
from tragos.venue import create_venue


class DatabaseManager:

    def __init__(self, url: str, name: str):
        self.client = MongoClient(url)
        self.db = self.client[name]

    def load_initial_data(self):
        venue = create_venue()
        self.db["venues"].update_one({"_id": venue.id}, {"$set": asdict(venue)}, upsert=True)

    def events(self) -> pymongo.collection.Collection:
        return self.db['events']

    def venues(self) -> pymongo.collection.Collection:
        return self.db['venues']

    @staticmethod
    def from_config():
        return DatabaseManager(Config.DATABASE_URL, Config.DATABASE_NAME)


if __name__ == '__main__':
    db_manager = DatabaseManager.from_config()
    db_manager.load_initial_data()
