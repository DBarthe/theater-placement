export interface Seat {
    row_name: string
    col_name: string
    x: number
    y: number
    row_n: number
    seat_n: number
    accessible: boolean
    value: number
}

export interface Row {
    name: string
    row_n: number
    seats: Seat[]
}

export interface Venue {
    _id: string
    height: number
    width: number
    default_seat_width: number
    default_seat_height: number
    stage_center_x: number
    stage_center_y: number
    num_seats: number
    rows: Row[]
}

export interface Group {
    name: string
    size: number
    accessibility: boolean
    slot: Slot|null
}

export enum Phase {
    NORMAL = "NORMAL",
    ON_SITE = "ON_SIZE",
    CLOSING = "CLOSING",
    FINISHED = "FINISHED"
}

export interface Requirements {
    group_queue: Group[]
    lock_accessibility: boolean
    phase: Phase
    max_group_size: number
    min_distance: number
}

export interface Slot {
    size: number
    row_n: number
    seat_n: number
    seats: Seat[]
}

export enum SeatStatus {
    EMPTY = "EMPTY",
    OCCUPIED = "OCCUPIED",
    BLOCKED = "BLOCKED"
}

export interface SeatSolution {
    status: SeatStatus
    slot_n: number|null
    group_n: number|null
}

export interface Solution {
    success: boolean

    num_groups_placed: number
    num_groups_declined: number

    num_seats_occupied: number
    num_seats_blocked: number
    num_seats_empty: number

    covid_score: number

    slots: Slot[]
    assignments: (number|null)[]

    grid: SeatSolution[][]
}

export interface Event {
    _id: string
    show_date: string
    venue_id: string
    name: string
    requirements: Requirements
    solution: Solution
}
