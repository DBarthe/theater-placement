from flask import Flask

from tragos import Config

app = Flask('tragos')


@app.route('/')
def index():
    return "hello"


def main():
    app.run(host=Config.BIND_ADDRESS, port=Config.BIND_PORT, debug=Config.FLASK_DEBUG)


if __name__ == '__main__':
    main()
