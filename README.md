# Tragos placement

## Requirements

* Python 3.8
* Virtualenv
* Pip

## Setup

From console :
```bash
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

Or simply open repository folder inside PyCharm IDE.

## Usage

Run the flask api server on http://localhost:8080:
```
./server.py
```

Run the simulator:
```
python -O ./simulator.py --help
```

Start the react ui :
```
npm start --prefix tragos-ui
```