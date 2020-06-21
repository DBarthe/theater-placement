import React, { useMemo } from 'react';
import { Event, Venue, Solution } from './Models';
import { ProgressBar, Label, Icon } from '@blueprintjs/core';

interface StatsViewProps {
    event: Event
    venue: Venue | null
    solution: Solution | null
}

export function StatsView(props: StatsViewProps) {

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
            <h6 className="bp3-heading">Remplissage {icon}</h6>
            <ProgressBar className={skeleton && "bp3-skeleton" || ""} value={progressValue} animate={false} intent={"primary"} />
            <ul style={{ columns: 3, listStyle: "none" }}>
                <li className={skeleton && "bp3-skeleton" || ""}>Places disponibles : {props.solution?.num_seats_empty}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Occupées : {props.solution?.num_seats_occupied}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Bloquées : {props.solution?.num_seats_blocked}</li>
            </ul>
            <ul style={{ columns: 2, listStyle: "none" }}>
                <li className={skeleton && "bp3-skeleton" || ""}>Groupes acceptés : {props.solution?.num_groups_placed}</li>
                <li className={skeleton && "bp3-skeleton" || ""}>Refusés : {props.solution?.num_groups_declined}</li>
            </ul>

            <h6 className="bp3-heading">Score COVID</h6>
            <ProgressBar className={skeleton && "bp3-skeleton" || ""} value={props.solution?.covid_score || 0} animate={false} intent={"danger"} />

        </div>
    )
}


