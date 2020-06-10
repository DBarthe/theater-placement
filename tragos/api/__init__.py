from flask import Flask

from tragos.api.index import index_blueprint

app = Flask('tragos')
app.register_blueprint(index_blueprint)


def main():
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()
