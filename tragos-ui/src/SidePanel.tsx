import React, { useCallback, ReactNode } from 'react';
import { Group, Seat, Solution } from './Models';
import { MdAccessible } from 'react-icons/md';
import { Icon } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';

interface SidePanelProps {
    group_queue: Group[]
    setHoveredGroup: (group: Group | null) => any
    selectedGroup: Group | null
    baseUrl: string
    solution: Solution | null;
}

export function SidePanel(props: SidePanelProps) {
    const history = useHistory();

    const handleMouseEnter = useCallback(event => {
        const group_n = parseInt(event.target.getAttribute("data-group-n"))
        props.setHoveredGroup(props.group_queue[group_n])
    }, [props.setHoveredGroup, props.group_queue]);

    const handleMouseLeave = useCallback(event => {
        props.setHoveredGroup(null)
    }, [props.setHoveredGroup, props.group_queue]);

    const handleClick = useCallback(event => {
        const group_n = parseInt(event.target.getAttribute("data-group-n"))
        history.push(`${props.baseUrl}/groups/${group_n}`)
        event.stopPropagation()
    }, [history, props.group_queue, props.baseUrl]);

    const handleClickOutside = useCallback(event => {
        history.push(`${props.baseUrl}`)
    }, [history,  props.baseUrl]);

    function groupListItem(group: Group): ReactNode {

        let assignIcon;

        if (props.solution === null || group.group_n >= props.solution.assignments.length) {
            assignIcon = <Icon icon="outdated" style={{ marginLeft: "5px" }}></Icon>
        }
        else if (props.solution.assignments[group.group_n] === null) {
            assignIcon = <Icon icon="warning-sign" intent={"danger"} style={{ marginLeft: "5px" }}></Icon>;
        }
        else {
            assignIcon = <Icon icon="endorsed" intent={"success"} style={{ marginLeft: "5px" }}></Icon>;
        }

        return (
            <li key={group.group_n}
                className={props.selectedGroup && props.selectedGroup.group_n === group.group_n ? "group-selected" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                data-group-n={group.group_n}>
                {group.name} [{group.size}]
                {assignIcon}

                {group.accessibility && <MdAccessible className="bp3-icon" style={{ marginLeft: "5px", color: (group.accessible_locked ? "green" : "black") }} />}
                {group.slot && <Icon icon="lock" style={{ marginLeft: "5px" }}></Icon>}
            </li>
        )
    }

    return (
        <div className="side-panel bp3-card">
            <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
                <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
                <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
            </ul>
            <div className="side-panel-tab bp3-tab-panel" role="tabpanel" onClick={handleClickOutside}>
                <ul className="side-list">
                    {props.group_queue.map(groupListItem)}
                </ul>
            </div>
        </div >

    );
}
