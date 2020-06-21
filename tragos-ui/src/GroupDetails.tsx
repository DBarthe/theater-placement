import React from 'react';
import { Group } from './Models';
import { Divider } from '@blueprintjs/core';

interface GroupDetailsProps {
  group: Group;
}

export function GroupDetails(props: GroupDetailsProps) {
  const { group } = props;

  return (
    <div className="bp3-card main-panel-info-card">
      <h6 className="bp3-heading">Groupe {group.group_n}</h6>
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
