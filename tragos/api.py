import traceback

import dateutil.parser
import flask
from bson import ObjectId
from flask import Flask, jsonify, request
from schema import Schema, And, Use, SchemaError

from tragos import Config
from tragos.database import DatabaseManager
from tragos.models import Group
from tragos.services import TragosException, MainService, NotFoundException

app = Flask('tragos')
db = DatabaseManager.from_config()

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


@app.route('/load_fake_data', methods=['POST'])
def load_fake_data():
    event = service.load_fake_data()
    return jsonify(event)


@app.route("/events")
def list_events():
    events = service.list_events()
    return jsonify(events)


create_event_schema = Schema({
    "name": And(str, len),
    "show_date": And(str, Use(dateutil.parser.parse)),
    "venue_id": And(str, len, ObjectId.is_valid, Use(ObjectId))
})


@app.route("/events", methods=["POST"])
def create_event():
    content = create_event_schema.validate(request.json)
    event = service.create_event(**content)
    return jsonify(event)


object_id_schema = Schema(And(str, len, ObjectId.is_valid, Use(ObjectId)))


@app.route("/events/<event_id>", methods=["GET"])
def get_event(event_id: str):
    object_id = object_id_schema.validate(event_id)
    event = service.get_event(object_id)
    return jsonify(event)


@app.route("/venues/<venue_id>", methods=["GET"])
def get_venue(venue_id: str):
    object_id = object_id_schema.validate(venue_id)
    venue = service.get_venue(object_id)
    return jsonify(venue)


group_schema = Schema({
    "name": And(str, len),
    "size": And(int, lambda size: size > 0),
    "accessibility": bool
})


@app.route("/events/<event_id>/groups", methods=["POST"])
def add_group(event_id: str):
    event_id = object_id_schema.validate(event_id)
    content = group_schema.validate(request.json)
    event = service.add_group(event_id, **content)
    return jsonify(event)


@app.route("/events/<event_id>/groups/<group_n>", methods=["PUT"])
def update_group(event_id: str, group_n: str):
    event_id = object_id_schema.validate(event_id)
    group_n = Schema(And(str, Use(int))).validate(group_n)
    content = group_schema.validate(request.json)
    group = Group(group_n=group_n, **content)
    event = service.update_group(event_id, group)
    return jsonify(event)


@app.route("/events/<event_id>/groups/<group_n>", methods=["DELETE"])
def delete_group(event_id: str, group_n: str):
    event_id = object_id_schema.validate(event_id)
    group_n = Schema(And(str, Use(int))).validate(group_n)
    event = service.delete_group(event_id, group_n)
    return jsonify(event)


@app.route("/events/<event_id>/compute", methods=["POST"])
def compute_solution(event_id: str):
    event_id = object_id_schema.validate(event_id)
    solution = service.compute_solution(event_id)
    return jsonify(solution)


@app.errorhandler(NotFoundException)
def handle_not_found_error(e: NotFoundException):
    traceback.print_exc()
    return jsonify(error={
        "code": 404,
        "type": "not_found",
        "message": str(e)
    }), 404


@app.errorhandler(404)
def handle_page_not_found_error(e: Exception):
    traceback.print_exc()
    return jsonify(error={
        "code": 404,
        "type": "not_found",
        "message": str(e)
    }), 404


@app.errorhandler(TragosException)
def handle_tragos_error(e: TragosException):
    traceback.print_exc()
    return jsonify(error={
        "code": 400,
        "type": "bad_request",
        "message": str(e)
    }), 400


@app.errorhandler(SchemaError)
def handle_schema_error(e: SchemaError):
    traceback.print_exc()
    return jsonify(error={
        "code": 400,
        "type": "bad_request",
        "message": str(e)
    }), 400


@app.errorhandler(Exception)
def handle_error(e: Exception):
    traceback.print_exc()
    return jsonify(error={
        "code": 500,
        "type": "internal",
        "message": "Internal server error"
    }), 500


def main():
    app.run(host=Config.BIND_ADDRESS, port=Config.BIND_PORT, debug=Config.FLASK_DEBUG)


if __name__ == '__main__':
    main()
