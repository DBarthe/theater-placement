import React, { useCallback, ReactNode } from 'react';
import { Group, Seat, Solution } from './Models';
import { MdAccessible } from 'react-icons/md';
import { Icon } from '@blueprintjs/core';

interface SidePanelProps {
    group_queue: Group[]
    setHoveredGroup: (group: Group | null) => any
    selectedGroup: Group | null
    setSelectedGroup: (group: Group | null) => any
    solution: Solution | null;
}

export function SidePanel(props: SidePanelProps) {

    const handleMouseEnter = useCallback(event => {
        const group_n = parseInt(event.target.getAttribute("data-group-n"))
        props.setHoveredGroup(props.group_queue[group_n])
    }, [props.setHoveredGroup, props.group_queue]);

    const handleMouseLeave = useCallback(event => {
        props.setHoveredGroup(null)
    }, [props.setHoveredGroup, props.group_queue]);

    const handleClick = useCallback(event => {
        const group_n = parseInt(event.target.getAttribute("data-group-n"))
        props.setSelectedGroup(props.group_queue[group_n])
    }, [props.setSelectedGroup, props.group_queue]);


    function groupListItem(group: Group): ReactNode {

        let assignIcon;

        if (props.solution === null || group.group_n >= props.solution.assignments.length) {
            assignIcon = <Icon icon="outdated" style={{ margin: "0 5px" }}></Icon>
        }
        else if (props.solution.assignments[group.group_n] === null) {
            assignIcon = <Icon icon="warning-sign" intent={"danger"} style={{ margin: "0 5px" }}></Icon>;
        }
        else {
            assignIcon = <Icon icon="endorsed" intent={"success"} style={{ margin: "0 5px" }}></Icon>;
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

                {group.accessibility && <MdAccessible className="bp3-icon" style={{ margin: "0 5px" }} />}
                {group.slot && <Icon icon="lock" style={{ margin: "0 5px" }}></Icon>}
            </li>
        )
    }

    return (
        <div className="side-panel bp3-card">
            <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
                <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
                <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
            </ul>
            <div className="side-panel-tab bp3-tab-panel" role="tabpanel">
                <ul className="side-list">
                    {props.group_queue.map(groupListItem)}
                </ul>
            </div>
        </div >

    );
}
