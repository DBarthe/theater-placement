import traceback

import dateutil.parser
import flask
from bson import ObjectId
from flask import Flask, jsonify, request
from schema import Schema, And, Use

from tragos import Config
from tragos.database import DatabaseManager
from tragos.services import TragosException, MainService

app = Flask('tragos')
db = DatabaseManager.from_config()
db.load_initial_data()

service = MainService(db)


class JSONEncoder(flask.json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return flask.json.JSONEncoder.default(self, o)


app.json_encoder = JSONEncoder


@app.route('/')
def index():
    return "hello"


@app.route("/events")
def list_events():
    events = service.list_events()
    return jsonify(events)


create_event_schema = Schema({
    "name": And(str, len),
    "show_date": And(str, Use(dateutil.parser.parse)),
    "venue_id": And(str, len, Use(ObjectId))
})


@app.route("/events", methods=["POST"])
def create_event():
    content = create_event_schema.validate(request.json)
    event = service.create_event(**content)
    return jsonify(event)


@app.route("/events/<event_id>", methods=["GET"])
def get_event(event_id: str):
    event = service.get_event(ObjectId(event_id))
    return jsonify(event)


@app.errorhandler(TragosException)
def handle_tragos_error(e: TragosException):
    traceback.print_exc()
    return jsonify(error={
        "code": 400,
        "type": type(e).__name__,
        "message": str(e)
    }), 400


@app.errorhandler(Exception)
def handle_tragos_error(e: Exception):
    traceback.print_exc()
    return jsonify(error={
        "code": 500,
        "type": type(e).__name__,
        "message": str(e)
    }), 500


def main():
    app.run(host=Config.BIND_ADDRESS, port=Config.BIND_PORT, debug=Config.FLASK_DEBUG)


if __name__ == '__main__':
    main()
