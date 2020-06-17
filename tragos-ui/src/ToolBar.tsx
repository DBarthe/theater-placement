import React from 'react';
import { Button, Classes, Icon, Divider, ButtonGroup, Switch as BpSwitch, RadioGroup, Radio, Popover, ControlGroup } from "@blueprintjs/core";
import { Link, useRouteMatch } from 'react-router-dom';

interface ToolbarProps {
    onClickAddGroup?: () => any
}

function removeTrailingSlash(path : string) : string {
    if (path.endsWith('/')) {
        path = path.slice(0, path.length - 1)
    }
    return path
}

export function ToolBar(props: ToolbarProps) {
    const match = useRouteMatch()

    return (
        <div className="main-panel-toolbar">
            <ButtonGroup>
                <Link to={`${removeTrailingSlash(match.url)}/add_group`}>
                    <Button icon="add" intent={"primary"}>Ajouter un groupe</Button>
                </Link>
                <Link to="import_groups">
                    <Button icon="import" intent={"primary"}>Importer un fichier</Button>
                </Link>
            </ButtonGroup>
            <Button icon="refresh" intent={"success"} className="main-panel-toolbar-item">Recalculer</Button>
            <Button icon="take-action" intent={"warning"} className="main-panel-toolbar-item">Placer les arrivés</Button>
            <ButtonGroup minimal={false} className="main-panel-toolbar-item">
                <Button icon="undo" intent={"none"}></Button>
                <Button icon="redo" intent={"none"}></Button>
            </ButtonGroup>
            <Popover position="bottom">
                <Button text="Mode" rightIcon="caret-down" icon="wrench" className="main-panel-toolbar-item" />
                <ControlGroup fill={false} vertical={true} className="select-mode-popover">
                    <RadioGroup
                        label="Mode"
                        onChange={console.log}
                        selectedValue={"one"}
                    >

                        <Radio label="Pré-ventes" value="one" />
                        <Radio label="Sur place" value="two" />
                        <Radio label="Clôture" value="three" />
                    </RadioGroup>
                    <Divider></Divider>
                    <label className={Classes.LABEL}>
                        PMR
                    </label>
                    <BpSwitch alignIndicator="center" labelElement={<span><Icon icon="lock" /></span>} />

                </ControlGroup>
            </Popover>
        </div>
    );
}
