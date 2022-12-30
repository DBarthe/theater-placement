# Theater placement

Ceci était un projet pour aider un festival de théatre à opérer durant la période covid (hors confinement), en optimisant le placement des spectateurs de facon à minimiser les risques de transmission du virus tout en permettant aux groupes de s'installer côté à côte.

Il prenait en compte différents critères comme le placement des personnes à mobilité réduite et l'attribution des meilleurses places en fonction de l'ordre de réservation.

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
