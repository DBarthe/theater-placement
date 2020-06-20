import React, { useEffect } from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Event, Venue } from './Models';
import { useRouteMatch, Route, Switch as SwitchRoute } from 'react-router-dom';
import { FormAddGroup } from './GroupForms';
import { ProgressBar, Label } from '@blueprintjs/core';
import { useFetch } from './FetchReducer';

interface StatsViewProps {
    event: Event
}

function StatsView(props: StatsViewProps) {


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

    const [{ data : venue, isLoading, isError }, setUrl, doFetch] = useFetch<Venue>(`/venues/${props.event.venue_id}`)

    useEffect(() => {
        setUrl(`/venues/${props.event.venue_id}`)
    }, [props.event.venue_id])

    return (
        <div className="main-panel">
            <ToolBar onClickAddGroup={() => null} />
            <div className="main-panel-info">
                <PanelInfo event={props.event} refreshEvent={props.refreshEvent} />
            </div>
            <div className="main-panel-map">
                { venue &&
                    <VenueMap venue={venue} requirements={props.event.requirements} solution={props.event.solution}></VenueMap> 
                }
            </div>
        </div>
    );
}
