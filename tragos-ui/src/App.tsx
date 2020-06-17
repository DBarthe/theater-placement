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

  const [title, setTitle] = useState<string>()

  return (
    <Router>
      <TopBar title={title} />
      <Switch>
        <Route path="/events/:id">
          <EventPage setTitle={setTitle}></EventPage>
        </Route>
      </Switch>
    </Router>
  );
}


interface EventPageProps {
  setTitle: Dispatch<SetStateAction<string | undefined>>
}

function EventPage(props : EventPageProps) {
  let { id } = useParams();

  const [{ data : event, isLoading, isError }, setUrl, doFetch] = useFetch<Event>(`/events/${id}`)

  
  useEffect(() => {
    if (!event) {
      props.setTitle(undefined)
    }
    else {
      const date = new Date(Date.parse(event.show_date))
      props.setTitle(`${event.name} ${date.toLocaleDateString('fr-FR')}`)
    }
  }, [event])

  return <>
  {/* <div style={{position: "absolute", top: "200px"}}>
    <p>{ data ? data.name : "" }</p>
    <p>{ isError ? "error" : "" }</p>
    <p>{ isLoading ? "loading" : "" }</p>
    </div> */}
    <SidePanel group_queue={event?.requirements.group_queue || []}/>
    { event && <MainPanel event={event} refreshEvent={doFetch}/> }
  </>
}

export default App;
