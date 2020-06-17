import React from 'react';
import { Event, Group } from './Models';
import { MdAccessible } from 'react-icons/md';
import { groupCollapsed } from 'console';

interface SidePanelProps {
    group_queue: Group[]
}

export function SidePanel(props: SidePanelProps) {
    return (
        <div className="side-panel bp3-card">
            <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
                <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
                <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
            </ul>
            <div className="side-panel-tab bp3-tab-panel" role="tabpanel">
                <ul className="side-list">
                    {props.group_queue.map((group: Group, index: number) =>
                        <li key={index.toString()}>{group.name} - {group.size} pers
                            {group.accessibility && <MdAccessible className="bp3-icon"/>}
                        </li>
                    )}
                </ul>
            </div>
        </div >

    );
}
