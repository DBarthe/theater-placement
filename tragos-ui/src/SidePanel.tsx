import React, { useCallback } from 'react';
import { Group } from './Models';
import { MdAccessible } from 'react-icons/md';

interface SidePanelProps {
    group_queue: Group[]
    setHoveredGroup: (group: Group | null) => any
}



export function SidePanel(props: SidePanelProps) {

    const handleMouseEnter = useCallback(event => {
        const group_n = parseInt(event.target.getAttribute("data-group-n"))
        props.setHoveredGroup(props.group_queue[group_n])
    }, []);

    const handleMouseLeave = useCallback(event => {
        props.setHoveredGroup(null)
    }, []);

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
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
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
