import { useParams, Link } from "react-router-dom";
import { useState, useCallback, ChangeEvent } from "react";
import { Divider, FormGroup, InputGroup, NumericInput, Button, Intent, Switch } from "@blueprintjs/core";
import { MdAccessible } from "react-icons/md";
import React from "react";
import Axios from "axios";

interface FormAddGroupProps {
    refreshEvent: () => any
}
export function FormAddGroup(props : FormAddGroupProps) {

    let { id } = useParams();
    
    const [name, setName] = useState<string>("")
    const [size, setSize] = useState<number>(1)
    const [accessibility, setAccessibility] = useState<boolean>(false)
    
    const handleNameChange = useCallback((e : ChangeEvent<HTMLInputElement>) => { setName(e.target.value) }, [])
    const toogleAccessibility = useCallback(() => { setAccessibility(!accessibility) }, [accessibility])

    const isValid = useCallback(() => {
        return name.length > 0
    }, [name])

    const handleSubmit = useCallback(async () => {
        await Axios.post(`/events/${id}/groups`, {
            name, size, accessibility
        })
        handleReset()
        props.refreshEvent()
    }, [id, name, size, accessibility])

    const handleReset = useCallback(() => {
        setName("");
        setSize(1);
        setAccessibility(false);
    }, [])


    return <div className="bp3-card main-panel-info-card">
        <h3 className="bp3-heading">Ajouter un groupe</h3>
        <Divider></Divider>
        <div className="main-panel-info-form">

            <FormGroup
                label="Nom"
                labelFor="name-input"
                inline={true}
            >
                <InputGroup id="name-input" placeholder="Nom de la réservation" value={name} onChange={handleNameChange} required></InputGroup>
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
                    value={size}
                    onValueChange={setSize}
                />
            </FormGroup>

            <FormGroup
                label={<span>PMR <MdAccessible></MdAccessible></span>}
                labelFor="accessibility-input"
                inline={true}
            >
                <Switch id="accessibility-input" checked={accessibility} onClick={toogleAccessibility} />
            </FormGroup>

            <Link to={"."}>
                <Button className="main-panel-info-form-button" icon="cross" intent={Intent.DANGER} type="reset" onClick={handleReset}>Annuler</Button>
            </Link>
            <Button className="main-panel-info-form-button" icon="add" intent={Intent.SUCCESS} type="submit" onClick={handleSubmit} disabled={!isValid()}>Ajouter</Button>

        </div>
    </div>
}