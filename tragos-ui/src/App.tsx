import React, { useEffect, useState, useReducer, SetStateAction, Dispatch } from 'react';
import { BrowserRouter as Router, Switch, Route, useParams } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './App.css';

import { TopBar } from './TopBar';
import { SidePanel } from './SidePanel';
import { MainPanel } from './MainPanel';
import { useFetch } from './FetchReducer';
import { Event } from './Models';

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





function EventPage() {
  let { id } = useParams();

  const [{ data : event, isLoading, isError }, doFetch] = useFetch<Event>(`/events/${id}`)

  return <>
  {/* <div style={{position: "absolute", top: "200px"}}>
    <p>{ data ? data.name : "" }</p>
    <p>{ isError ? "error" : "" }</p>
    <p>{ isLoading ? "loading" : "" }</p>
    </div> */}
    <SidePanel group_queue={event?.requirements.group_queue || []}/>
    <MainPanel/>
  </>
}

export default App;
