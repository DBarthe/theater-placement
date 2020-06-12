import React, { Props } from 'react';
import logo from './logo.svg';

import { Button, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Tabs, Tab, Classes, Card, Icon, MenuItem, HTMLTable, Divider } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './App.css';

function App() {
  return (
    <Router>
      <TopBar />
      <SidePanel />
    </Router>
  );
}

function TopBar() {
  return (
    <Navbar className="bp3-dark topbar">
      <NavbarGroup>
        <Link to="/" className=".bp3-navbar-heading">Tragos</Link>
        <NavbarDivider />
        <Link to="/venues" className="bp3-button bp3-minimal">Configuration</Link>
        <Link to="/venues" className="bp3-button bp3-minimal">Spectacles</Link>

        <Select
          itemRenderer={(item, { handleClick, modifiers }) => <MenuItem
            active={modifiers.active}
            key={item}
            onClick={handleClick}
            text={item}
          />}
          items={["toto", "tata", "titi", "tutu"]}
          onItemSelect={(item) => console.log(`selected item ${item}`)}
          itemPredicate={(query, item) => {
            return query.trim() === "" || item.toLowerCase().indexOf(query.toLowerCase()) != -1
          }}>
          <Link to="/events" className="bp3-button bp3-minimal">Accès rapide <Icon icon="caret-down" style={{ marginLeft: "10px" }} /></Link>
        </Select>
      </NavbarGroup>
    </Navbar>
  )
}

function SidePanel() {
  return (
    <div className="side-panel bp3-card bp3-elevation-1">
      <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
        <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
        <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
      </ul>
      <div className="side-panel-tab bp3-tab-panel" role="tabpanel">
        <ul className="side-list">
          <li onClick={() => console.log("TODO clickable list")}>Landry Le Tenier</li>
          <li>Barthélémy Delemotte</li>
          <li>Pierre Hammard</li>
          <li>Mathilde Rolland</li>
          <li>Victoire Hoquet</li>
          <li>Landry Le Tenier</li>
          <li>Barthélémy Delemotte</li>
          <li>Pierre Hammard</li>
          <li>Mathilde Rolland</li>
          <li>Victoire Hoquet</li>
          <li>Landry Le Tenier</li>
          <li>Barthélémy Delemotte</li>
          <li>Pierre Hammard</li>
          <li>Mathilde Rolland</li>
          <li>Victoire Hoquet</li>
          <li>Landry Le Tenier</li>
          <li>Barthélémy Delemotte</li>
          <li>Pierre Hammard</li>
          <li>Mathilde Rolland</li>
          <li>Victoire Hoquet</li>
          <li>Landry Le Tenier</li>
          <li>Barthélémy Delemotte</li>
          <li>Pierre Hammard</li>
          <li>Mathilde Rolland</li>
          <li>Victoire Hoquet</li>
        </ul>
      </div>
    </div>

  )
}

export default App;
