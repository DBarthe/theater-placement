from math import sqrt, atan

from bson import ObjectId

from tragos.models import Row, Seat, Venue


def compute_distance_and_angle(venue: Venue, seat: Seat) -> (float, float):
    distance = sqrt((seat.x - venue.stage_center_x) ** 2 + (seat.y - venue.stage_center_y) ** 2)
    angle = atan(abs(seat.x - venue.stage_center_x) / abs(seat.y - venue.stage_center_y))
    return distance, angle


def compute_all_seats_value(venue: Venue):
    tmp = []
    max_distance = None
    min_distance = None
    max_angle = None
    min_angle = None
    for row in venue.rows:
        for seat in row.seats:
            distance, angle = compute_distance_and_angle(venue, seat)
            max_distance = distance if max_distance is None else max(max_distance, distance)
            min_distance = distance if min_distance is None else min(min_distance, distance)
            max_angle = angle if max_angle is None else max(max_angle, angle)
            min_angle = angle if min_angle is None else min(min_angle, angle)
            tmp.append((seat.row_n, seat.seat_n, distance, angle))

    for row_n, seat_n, distance, angle in tmp:
        inverse_normalized_distance = 1 - (distance - min_distance) / (max_distance - min_distance)
        inverse_normalized_angle = 1 - (angle - min_angle) / (max_angle - min_angle)
        value = (inverse_normalized_distance + inverse_normalized_angle) / 2
        venue.rows[row_n].seats[seat_n].value = value


def create_venue() -> Venue:
    rows = [
        Row(name='A', row_n=0, seats=[
            Seat(row_name='A', col_name='1', row_n=0, seat_n=0, x=1, y=1, accessible=False),
            Seat(row_name='A', col_name='2', row_n=0, seat_n=1, x=2, y=1, accessible=False),
            Seat(row_name='A', col_name='3', row_n=0, seat_n=2, x=3, y=1, accessible=False),
            Seat(row_name='A', col_name='4', row_n=0, seat_n=3, x=4, y=1, accessible=False)
        ]),
        Row(name='B', row_n=1, seats=[
            Seat(row_name='B', col_name='1', row_n=1, seat_n=0, x=1, y=2, accessible=False),
            Seat(row_name='B', col_name='2', row_n=1, seat_n=1, x=2, y=2, accessible=False),
            Seat(row_name='B', col_name='3', row_n=1, seat_n=2, x=3, y=2, accessible=False),
        ]),
        Row(name='B', row_n=2, seats=[
            Seat(row_name='C', col_name='1', row_n=2, seat_n=0, x=1, y=3, accessible=False),
            Seat(row_name='C', col_name='2', row_n=2, seat_n=1, x=2, y=3, accessible=False),
            Seat(row_name='C', col_name='3', row_n=2, seat_n=2, x=3, y=3, accessible=False),
        ])
    ]

    venue = Venue(_id=ObjectId("a" * 24), num_seats=10, rows=rows, stage_center_x=2.5, stage_center_y=0)
    compute_all_seats_value(venue)
    return venue
