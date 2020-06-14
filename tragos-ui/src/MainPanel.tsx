import React from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Venue, Seat } from './Models';

const VENUE: Venue = {
    width: 5,
    height: 6,
    defaultSeatHeight: 0.8,
    defaultSeatWidth: 0.8
}

const SEATS: Seat[] = [
    { name: "A1", x: 1, y: 1 },
    { name: "A2", x: 2, y: 1 },
    { name: "A3", x: 3, y: 1 },
    { name: "A4", x: 4, y: 1 },
]

export function MainPanel() {
    return (
        <div className="main-panel">
            <ToolBar />
            <div className="main-panel-info">
                <p>sdsqsd</p>
            </div>
            <div className="main-panel-map">
                <VenueMap venue={VENUE} seats={SEATS}></VenueMap>
            </div>
        </div>
    );
}
