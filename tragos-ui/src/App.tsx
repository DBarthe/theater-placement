import React, { useEffect, useState, useReducer, SetStateAction, Dispatch } from 'react';
import { BrowserRouter as Router, Switch, Route, useParams } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './App.css';

import { TopBar } from './TopBar';
import { SidePanel } from './SidePanel';
import { MainPanel } from './MainPanel';
import { useFetch } from './FetchReducer';

function App() {
  return (
    <Router>
      <TopBar />
      <Switch>
        <Route path="/events/:id">
          <EventPage></EventPage>
        </Route>
      </Switch>
    </Router>
  );
}


interface Event {
  id: string
  show_date: string
  venue_id: string
  name: string
}



function EventPage() {
  let { id } = useParams();

  const [{ data, isLoading, isError }, doFetch] = useFetch<Event>(`/events/${id}`)

  return <>
  <div style={{position: "absolute", top: "200px"}}>
    <p>{ data ? data.name : "" }</p>
    <p>{ isError ? "error" : "" }</p>
    <p>{ isLoading ? "loading" : "" }</p>
    </div>
    {/* <SidePanel />
    <MainPanel /> */}
  </>
}

export default App;
