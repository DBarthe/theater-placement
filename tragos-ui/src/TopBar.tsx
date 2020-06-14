import React from 'react';
import { Navbar, NavbarGroup, NavbarDivider, Icon, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { Link } from 'react-router-dom';

export function TopBar() {
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
            key={item}
            onClick={handleClick}
            text={item} />}
          items={["toto", "tata", "titi", "tutu"]}
          onItemSelect={(item) => console.log(`selected item ${item}`)}
          itemPredicate={(query, item) => {
            return query.trim() === "" || item.toLowerCase().indexOf(query.toLowerCase()) !== -1;
          }}>
          <Link to="/events" className="bp3-button bp3-minimal">Accès rapide <Icon icon="caret-down" style={{ marginLeft: "10px" }} /></Link>
        </Select>
      </NavbarGroup>
    </Navbar>
  );
}
