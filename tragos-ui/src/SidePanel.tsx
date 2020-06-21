import React, { useCallback } from 'react';
import { Group, Seat } from './Models';
import { MdAccessible } from 'react-icons/md';

interface SidePanelProps {
    group_queue: Group[]
    setHoveredGroup: (group: Group | null) => any
    selectedGroup: Group | null
    setSelectedGroup: (group: Group | null) => any
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


    return (
        <div className="side-panel bp3-card">
            <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
                <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
                <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
            </ul>
            <div className="side-panel-tab bp3-tab-panel" role="tabpanel">
                <ul className="side-list">
                    {props.group_queue.map((group: Group, index: number) =>
                        <li key={index}
                            className={props.selectedGroup && props.selectedGroup.group_n === group.group_n ? "group-selected" : ""}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleClick}
                            data-group-n={group.group_n}

                        >{group.name} - {group.size} pers
                            {group.accessibility && <MdAccessible className="bp3-icon" />}
                        </li>
                    )}
                </ul>
            </div>
        </div >

    );
}
