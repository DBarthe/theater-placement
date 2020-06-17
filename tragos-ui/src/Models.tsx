export interface Seat {
    name: string
    x: number
    y: number
}

export interface Venue {
    height: number
    width: number
    defaultSeatWidth: number
    defaultSeatHeight: number
}

export interface Group {
    name: string
    size: number
    accessibility: boolean
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
}

export interface Event {
    _id: string
    show_date: string
    venue_id: string
    name: string
    requirements: Requirements
}
