import React from 'react';
import { Group } from './Models';
import { Divider, Button, Intent } from '@blueprintjs/core';
import { Link } from 'react-router-dom';

interface GroupDetailsProps {
    baseUrl: string
    group: Group
}

export function GroupDetails(props: GroupDetailsProps) {
    const { group, baseUrl } = props;

    return (
        <div className="bp3-card main-panel-info-card">
            <h6 className="bp3-heading">Groupe {group.group_n}
                <Link to={`${baseUrl}/groups/${group.group_n}/edit`} style={{margin: "0", position: "absolute", right: "20px"}}>
                    <Button className="main-panel-info-form-button bp3-small bp3-minimal" style={{margin: "0"}} icon="edit" intent={Intent.NONE}>Modifer</Button>
                </Link>
            </h6>
            <Divider></Divider>
            <div className="main-panel-info-form">
                <ul>
                    <li>Nom: {group.name}</li>
                    <li>Quantité: {group.size}</li>
                    <li>PMR: {group.accessibility ? "oui" : "non"}</li>
                    <li>Place fixe: {group.slot !== null ? "oui" : "non"}</li>
                </ul>


            </div>
        </div>
    );
}
