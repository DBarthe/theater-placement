import React, { Props } from 'react';
import logo from './logo.svg';

import { Button, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Tabs, Tab, Classes, Card, Icon, MenuItem, HTMLTable, Divider, ButtonGroup, AnchorButton, Switch as BpSwitch, RadioGroup, Radio, Popover, ControlGroup, InputGroup } from "@blueprintjs/core";
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
      <MainPanel />
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
          className="quick-access-popover"
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
    <div className="side-panel bp3-card">
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

function ToolBar() {
  return (
    <div className="main-panel-toolbar">
      <ButtonGroup minimal={false} className="main-panel-toolbar-item">
        <Button icon="add" intent={"primary"}>Ajouter un groupe</Button>
        <Button icon="import" intent={"primary"}>Importer un fichier</Button>
      </ButtonGroup>
      <Button icon="refresh" intent={"success"} className="main-panel-toolbar-item" >Recalculer</Button>
      <Button icon="take-action" intent={"warning"} className="main-panel-toolbar-item" >Placer les arrivés</Button>
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

      {/* } />
      <BpSwitch label="Mode retardataire" /> */}
    </div>
  )
}

function MainPanel() {
  return (
    <div className="main-panel">
      <ToolBar />
      <div className="main-panel-content">
        <div className="main-panel-info">
          <p>sdsqsd</p>
          {/* <div className="main-panel-details"></div>
          <div className="main-panel-stats"></div> */}
        </div>
        <div className="main-panel-map">
          <div className="map-image-wrapper">
            <div>
              <img src="plan-salle.jpg" className="map-image" alt=""/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
