import React, { useState, useCallback, useMemo } from 'react';
import { VenueMap } from './VenueMap';
import { ToolBar } from './ToolBar';
import { Venue, Seat } from './Models';
import { FormGroup, InputGroup, NumericInput, Switch, Divider, Button, Intent } from '@blueprintjs/core';
import { MdAccessible } from 'react-icons/md';
import { useRouteMatch, Route, Switch as SwitchRoute } from 'react-router-dom';

const VENUE: Venue = {
    width: 5,
    height: 6,
    defaultSeatHeight: 0.8,
    defaultSeatWidth: 0.8
}

const SEATS: Seat[] = [
    { name: "A1", x: 1, y: 1 },
    { name: "A2", x: 2, y: 1 },
    { name: "A3", x: 3, y: 1 },
    { name: "A4", x: 4, y: 1 },
]


function FormAddGroup() {
    return <div className="bp3-card">
        <h3 className="bp3-heading">Ajouter un groupe</h3>
        <Divider></Divider>
        <div className="main-panel-info-form">

            <FormGroup
                label="Nom"
                labelFor="name-input"
                inline={true}
            >
                <InputGroup id="name-input" placeholder="Nom de la réservation"></InputGroup>
            </FormGroup>
            <FormGroup
                label="Quantité"
                labelFor="size-input"
                inline={true}
            >
                <NumericInput id="size-input" placeholder="Nombre de places"
                    majorStepSize={1}
                    minorStepSize={1}
                    min={1} max={6}
                />
            </FormGroup>

            <FormGroup
                label={<span>PMR <MdAccessible></MdAccessible></span>}
                labelFor="accessibility-input"
                inline={true}
            >
                <Switch id="accessibility-input" />
            </FormGroup>

            <Button className="main-panel-info-form-button" icon="cross" intent={Intent.DANGER} type="reset">Annuler</Button>
            <Button className="main-panel-info-form-button" icon="add" intent={Intent.SUCCESS} type="submit">Ajouter</Button>
        </div>
    </div>
}

function PanelInfo() {

    let match = useRouteMatch();

    return (
        <SwitchRoute>
            <Route path={`${match.path}/add_group`}>
                <FormAddGroup />
            </Route>
            <Route path={match.path}>
                <></>
            </Route>
        </SwitchRoute>
    );
}

export function MainPanel() {

    return (
        <div className="main-panel">
            <ToolBar onClickAddGroup={() => null} />
            <div className="main-panel-info">
                <PanelInfo />
            </div>
            <div className="main-panel-map">
                <VenueMap venue={VENUE} seats={SEATS}></VenueMap>
            </div>
        </div>
    );
}
