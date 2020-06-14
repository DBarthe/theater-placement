import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './App.css';

import { TopBar } from './TopBar';
import { SidePanel } from './SidePanel';
import { MainPanel } from './MainPanel';

function App() {
  return (
    <Router>
      <TopBar />
      <SidePanel />
      <MainPanel />
    </Router>
  );
}

export default App;
