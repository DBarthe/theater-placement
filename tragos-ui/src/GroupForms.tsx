import { useParams, Link, useHistory } from "react-router-dom";
import { useState, useCallback, ChangeEvent, FunctionComponent } from "react";
import { Divider, FormGroup, InputGroup, NumericInput, Button, Intent, Switch } from "@blueprintjs/core";
import { MdAccessible } from "react-icons/md";
import React from "react";
import Axios from "axios";
import { Group } from "./Models";

interface BaseFormGroupProps {
    title: string
    name: string
    setName: (name: string) => any
    size: number
    setSize: (size: number) => any
    accessibility: boolean
    setAccessibility: (accessibility: boolean) => any
}

const BaseFormGroup: FunctionComponent<BaseFormGroupProps> = (props) => {

    const { title, name, setName, size, setSize, accessibility, setAccessibility, children } = props;

    const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { setName(e.target.value) }, [])
    const toogleAccessibility = useCallback(() => { setAccessibility(!accessibility) }, [accessibility])

    return <div className="bp3-card main-panel-info-card">
        <h6 className="bp3-heading">{title}</h6>
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

            {children}

        </div>
    </div>
}

interface FormAddGroupProps {
    refreshEvent: () => any
}
export function FormAddGroup(props: FormAddGroupProps) {

    let { id } = useParams();

    const [name, setName] = useState<string>("")
    const [size, setSize] = useState<number>(1)
    const [accessibility, setAccessibility] = useState<boolean>(false)

    const isValid = useCallback(() => {
        return name.length > 0
    }, [name])

    const handleReset = useCallback(() => {
        setName("");
        setSize(1);
        setAccessibility(false);
    }, [])


    const handleSubmit = useCallback(async () => {
        await Axios.post(`/events/${id}/groups`, {
            name, size, accessibility
        })
        handleReset()
        props.refreshEvent()
    }, [id, name, size, accessibility, handleReset, props])

    return (
        <BaseFormGroup
            title={"Ajouter un groupe"}
            name={name} setName={setName}
            size={size} setSize={setSize}
            accessibility={accessibility} setAccessibility={setAccessibility}
        >
            <Link to={"."}>
                <Button className="main-panel-info-form-button" icon="cross" intent={Intent.DANGER} type="reset" onClick={handleReset}>Fermer</Button>
            </Link>
            <Button className="main-panel-info-form-button" icon="add" intent={Intent.SUCCESS} type="submit" onClick={handleSubmit} disabled={!isValid()}>Ajouter</Button>
        </BaseFormGroup>)
}


interface FormEditGroupProps {
    refreshEvent: () => any
    event_id: string
    group: Group
    baseUrl: string
}
export const FormEditGroup: FunctionComponent<FormEditGroupProps> = ({ refreshEvent, event_id, group, baseUrl }) => {

    const history = useHistory()

    const [name, setName] = useState<string>(group.name)
    const [size, setSize] = useState<number>(group.size)
    const [accessibility, setAccessibility] = useState<boolean>(group.accessibility)

    const isValid = useCallback(() => {
        return name.length > 0
    }, [name])


    const handleSubmit = useCallback(async () => {
        await Axios.put(`/events/${event_id}/groups/${group.group_n}`, {
            name, size, accessibility
        })
        refreshEvent()
        history.push(`${baseUrl}/groups/${group.group_n}`)
    }, [event_id, name, size, accessibility, group])

    const handleReset = useCallback(async () => {
        history.push(`${baseUrl}/groups/${group.group_n}`)
    }, [event_id, group])

    return (
        <BaseFormGroup
            title={"Modifier un groupe"}
            name={name} setName={setName}
            size={size} setSize={setSize}
            accessibility={accessibility} setAccessibility={setAccessibility}
        >
            <Button className="main-panel-info-form-button" icon="cross" intent={Intent.DANGER} type="reset" onClick={handleReset}>Annuler</Button>
            <Button className="main-panel-info-form-button" icon="floppy-disk" intent={Intent.SUCCESS} type="submit" onClick={handleSubmit} disabled={!isValid()}>Sauvegarder</Button>
        </BaseFormGroup>
    )
}
