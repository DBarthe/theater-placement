import React, { useEffect, useMemo } from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Event, Venue, Solution, Requirements } from './Models';
import { useRouteMatch, Route, Switch as SwitchRoute } from 'react-router-dom';
import { FormAddGroup } from './GroupForms';
import { ProgressBar, Label, Icon } from '@blueprintjs/core';
import { useFetch } from './FetchReducer';

interface StatsViewProps {
    event: Event
    venue: Venue | null
    solution: Solution | null
}

function StatsView(props: StatsViewProps) {

    const progressValue = props.solution && props.venue ?
        (props.venue.num_seats - props.solution.num_seats_empty) / props.venue.num_seats : 0


    const icon = useMemo(() => {
        if (props.solution === null) {
            return <Icon icon="outdated" intent={"primary"}></Icon>;
        }
        else if (props.solution.success) {
            return <Icon icon="endorsed" intent={"success"}></Icon>;
        }
        else {
            return <Icon icon="warning-sign" intent={"danger"}></Icon>;
        }
    }, [props.solution?.success])

    const skeleton = (props.solution === null)

    return (
        <div className="bp3-card main-panel-info-card">
            <Label><b>Remplissage</b> {icon} </Label>
            <ProgressBar className={skeleton && "bp3-skeleton" || ""} value={progressValue} animate={false} intent={"primary"} />
            <ul style={{ columns: 3, listStyle: "none" }}>
                <li className={skeleton && "bp3-skeleton" || ""}>Places disponibles : {props.solution?.num_seats_empty}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Occupées : {props.solution?.num_seats_occupied}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Bloquées : {props.solution?.num_seats_blocked}</li>
            </ul>
            <ul style={{ columns: 3, listStyle: "none" }}>
                <li className={skeleton && "bp3-skeleton" || ""}>Groupes acceptés : {props.solution?.num_groups_placed}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Refusés : {props.solution?.num_groups_declined}</li>
            </ul>

            <Label><b>Score COVID</b></Label>
            <ProgressBar className={skeleton && "bp3-skeleton" || ""} value={props.solution?.covid_score || 0} animate={false} intent={"danger"} />

        </div>
    )
}

interface PanelInfoProps {
    event: Event
    venue: Venue
    solution: Solution | null
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
            <StatsView event={props.event} solution={props.solution} venue={props.venue}/>
        </>
    );
}


interface MainPanelProps {
    event: Event
    venue: Venue
    requirements: Requirements
    solution: Solution|null
    refreshEvent: () => any
}
export function MainPanel(props: MainPanelProps) {

    return (
        <div className="main-panel">
            <ToolBar onClickAddGroup={() => null} />
            <div className="main-panel-info">
                <PanelInfo event={props.event} refreshEvent={props.refreshEvent} venue={props.venue} solution={props.solution}/>
            </div>
            <div className="main-panel-map">
                {props.venue &&
                    <VenueMap venue={props.venue} requirements={props.requirements} solution={props.event.solution}></VenueMap>
                }
            </div>
        </div>
    );
}
