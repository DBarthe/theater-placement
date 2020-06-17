import React, {  } from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Venue, Seat } from './Models';
import { useRouteMatch, Route, Switch as SwitchRoute } from 'react-router-dom';
import { FormAddGroup } from './GroupForms';


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


interface PanelInfoProps {
    refreshEvent: () => any
}

function PanelInfo(props : PanelInfoProps) {

    let match = useRouteMatch();

    return (
        <SwitchRoute>
            <Route path={`${match.path}/add_group`}>
                <FormAddGroup refreshEvent={props.refreshEvent}/>
            </Route>
            <Route path={match.path}>
                <></>
            </Route>
        </SwitchRoute>
    );
}

interface MainPanelProps {
    refreshEvent: () => any
}
export function MainPanel(props : MainPanelProps) {

    return (
        <div className="main-panel">
            <ToolBar onClickAddGroup={() => null} />
            <div className="main-panel-info">
                <PanelInfo refreshEvent={props.refreshEvent}/>
            </div>
            <div className="main-panel-map">
                <VenueMap venue={VENUE} seats={SEATS}></VenueMap>
            </div>
        </div>
    );
}
