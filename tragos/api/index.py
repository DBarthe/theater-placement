from flask import Blueprint

index_blueprint = Blueprint('routes', __name__)


@index_blueprint.route('/')
def index():
    return "hello"
