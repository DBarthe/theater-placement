import traceback

import dateutil.parser
from flask import Flask, jsonify, request
from schema import Schema, And, Use

from tragos import Config, services
from tragos.database import DatabaseManager
from tragos.models import TragosData
from tragos.services import TragosException

app = Flask('tragos')
db = DatabaseManager.from_config()
db.load_initial_data()


def get_readonly_data() -> TragosData:
    return db.create_connection().root.tragos


@app.route('/')
def index():
    return "hello"


@app.route("/events")
def list_events():
    with db.create_transaction() as t:
        events = services.list_events(t.root.tragos)
        return jsonify(events)


create_event_schema = Schema({
    "name": And(str, len),
    "show_date": And(str, Use(dateutil.parser.parse)),
    "venue_uid": And(str, len)
})


@app.route("/events", methods=["POST"])
def create_event():
    content = create_event_schema.validate(request.json)
    with db.create_transaction() as t:
        event = services.create_event(t.root.tragos, **content)
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
