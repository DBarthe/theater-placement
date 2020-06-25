import React, { useCallback, useState, useEffect, ReactElement } from 'react';
import { Button, Classes, Icon, Divider, ButtonGroup, Switch as BpSwitch, RadioGroup, Radio, Popover, ControlGroup, Alert } from "@blueprintjs/core";
import { Link, useRouteMatch } from 'react-router-dom';
import Axios from 'axios';
import { Event, ApiError } from './Models'
import { removeTrailingSlash } from './utils';

interface ToolbarProps {
    refreshEvent: () => any
    event: Event
    baseUrl: string
}

const AlertError: React.FunctionComponent<{ message: string, close: () => any }> = ({ message, close }) => {
    return <Alert
        className=""
        intent={"danger"}
        confirmButtonText="Ok"
        isOpen={true}
        onClose={close}
    >
        <p>
            {message}
        </p>
    </Alert>;
}

export function ToolBar(props: ToolbarProps) {
    const match = useRouteMatch()
    const [computing, setComputing] = useState<boolean>(false);
    const [acessibleLocked, setAccessibleLocked] = useState<boolean>(props.event.requirements.lock_accessibility)
    const [accessibleLocking, setAccessibleLocking] = useState<boolean>(false);
    const [error, setError] = useState<ReactElement | null>(null);

    useEffect(() => {
        setAccessibleLocked(props.event.requirements.lock_accessibility)
    }, [props.event])

    const recompute = useCallback(async () => {
        setComputing(true)
        await Axios.post(`/events/${props.event._id}/compute`)
        setComputing(false)
        props.refreshEvent()
    }, [props.event, props.refreshEvent])

    const handleAccesibleLockChange = useCallback(async e => {

        const newValue = !acessibleLocked;

        setAccessibleLocking(true);
        setAccessibleLocked(newValue);

        try {
            const res = await Axios.post(`/events/${props.event._id}/accessibility/${newValue ? '' : 'un'}lock`, null, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            props.refreshEvent()
        }
        catch (exc) {
            setError(AlertError({ message: exc.response.data?.error?.message || exc.message, close: () => setError(null) }))
            setAccessibleLocked(!newValue);
        }
        finally {
            setAccessibleLocking(false);
        }
    }, [props.event, acessibleLocked])

    return (
        <div className="main-panel-toolbar">
            <ButtonGroup>
                <Link to={`${props.baseUrl}/add_group`}>
                    <Button icon="add" intent={"primary"}>Ajouter un groupe</Button>
                </Link>
                <Link to="import_groups">
                    <Button icon="import" intent={"primary"}>Importer un fichier</Button>
                </Link>
            </ButtonGroup>
            <Button icon="refresh" intent={"success"} className="main-panel-toolbar-item" disabled={computing} onClick={recompute}>Recalculer</Button>
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
                    <BpSwitch alignIndicator="center" labelElement={<span><Icon icon="lock" /></span>}
                        checked={acessibleLocked} onChange={handleAccesibleLockChange}
                        disabled={accessibleLocking}
                    />

                </ControlGroup>
            </Popover>
            {error}

        </div>
    );
}
