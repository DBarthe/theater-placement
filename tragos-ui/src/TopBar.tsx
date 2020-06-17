import React from 'react';
import { Navbar, NavbarGroup, NavbarDivider, Icon, MenuItem, Button } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { Link, useHistory } from 'react-router-dom';
import {Event} from './Models';
import { useFetch } from './FetchReducer';


interface TopBarProps {
    title?: string
    currentEvent?: Event
}

type EventList = Event[];

export function TopBar(props : TopBarProps) {

    const history = useHistory();

    const [{ data : events, isLoading, isError }, setUrl, doFetch] = useFetch<EventList>(`/events`)

    return (
        <Navbar className="bp3-dark topbar">
            <NavbarGroup>
                <Link to="/" className=".bp3-navbar-heading">Tragos</Link>
                <NavbarDivider />
                <Link to="/venues" className="bp3-button bp3-minimal">Configuration</Link>
                <Link to="/venues" className="bp3-button bp3-minimal">Spectacles</Link>

                <Select
                    className="quick-access-popover"
                    itemRenderer={(item, { handleClick, modifiers }) => <MenuItem
                        active={modifiers.active}
                        key={item._id}
                        onClick={handleClick}
                        text={item.name} />}
                    items={events || []}
                    onItemSelect={(event) =>{ history.push(`/events/${event._id}`)}}
                    itemPredicate={(query, item) => {
                        return query.trim() === "" || item.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    }}>
                    <Button minimal={true}>Accès rapide <Icon icon="caret-down" style={{ marginLeft: "10px" }} /></Button>
                </Select>
            </NavbarGroup>

            { props.title &&
                <NavbarGroup align="right">
                    {props.title}
                </NavbarGroup>
            }
        </Navbar>
    );
}
