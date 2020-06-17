import React, { } from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Venue, Seat, Event } from './Models';
import { useRouteMatch, Route, Switch as SwitchRoute } from 'react-router-dom';
import { FormAddGroup } from './GroupForms';
import { Divider, ProgressBar, Label } from '@blueprintjs/core';


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
    { name: "A4", x: 4, y: 1 }
]



interface StatsViewProps {
    event: Event
}

function StatsView(props: StatsViewProps) {

    const date = new Date(Date.parse(props.event.show_date))

    return (
        <div className="bp3-card main-panel-info-card">
            <Label>Remplissage : </Label>
            <ProgressBar  value={0.5} animate={false} intent={"primary"}/>
            <ul style={{columns: 4, listStyle: "none"}}>
                <li>Places Dispos : X</li>
                <li>Occupées : X</li>
                <li>Bloquées : X</li>
            </ul>

            <Label >Score COVID : </Label>
            <ProgressBar  value={0.7} animate={false} intent={"danger"}/>

        </div>
    )
}

interface PanelInfoProps {
    event: Event
    refreshEvent: () => any
}


function PanelInfo(props: PanelInfoProps) {

    let match = useRouteMatch();

    return (
        <>
            <SwitchRoute>
                <Route path={`${match.path}/add_group`}>
                    <FormAddGroup refreshEvent={props.refreshEvent} />
                </Route>
                <Route path={match.path}>
                    <></>
                </Route>
            </SwitchRoute>
            <StatsView event={props.event}/>
        </>
    );
}

interface MainPanelProps {
    event : Event
    refreshEvent: () => any
}
export function MainPanel(props: MainPanelProps) {

    return (
        <div className="main-panel">
            <ToolBar onClickAddGroup={() => null} />
            <div className="main-panel-info">
                <PanelInfo event={props.event} refreshEvent={props.refreshEvent} />
            </div>
            <div className="main-panel-map">
                <VenueMap venue={VENUE} seats={SEATS}></VenueMap>
            </div>
        </div>
    );
}
