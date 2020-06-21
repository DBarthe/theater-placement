import React, { useEffect, useState, useReducer, SetStateAction, Dispatch, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route, useParams } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import 'font-awesome/css/font-awesome.min.css';

import './App.css';

import { TopBar } from './TopBar';
import { SidePanel } from './SidePanel';
import { MainPanel } from './MainPanel';
import { useFetch } from './FetchReducer';
import { Event, Venue, Group } from './Models';

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

function EventPage(props: EventPageProps) {
  let { id } = useParams();

  const eventFetcher = useFetch<Event>(`/events/${id}`)
  const event = eventFetcher.state.data;

  const venueFetcher = useFetch<Venue>(null);
  const venue = venueFetcher.state.data;

  const [hoveredGroup, setHoveredGroup] = useState<Group | null>(null);

  useEffect(() => {
    eventFetcher.setUrl(`/events/${id}`)
  }, [id])


  useEffect(() => {
    if (eventFetcher.state.data !== null) {
      venueFetcher.setUrl(`/venues/${eventFetcher.state.data?.venue_id}`)
    }
    else {
      venueFetcher.setUrl(null)
    }
  }, [event?.venue_id])


  useEffect(() => {
    if (!event) {
      props.setTitle(undefined)
    }
    else {
      const date = new Date(Date.parse(event.show_date))
      props.setTitle(`${event.name} ${date.toLocaleDateString('fr-FR')}`)
    }
  }, [event, props])

  return <>
    {/* <div style={{position: "absolute", top: "200px"}}>
    <p>{ data ? data.name : "" }</p>
    <p>{ isError ? "error" : "" }</p>
    <p>{ isLoading ? "loading" : "" }</p>
    </div> */}
    <SidePanel group_queue={event?.requirements.group_queue || []}  setHoveredGroup={setHoveredGroup} />
    {event && venue &&
      <MainPanel
        event={event}
        venue={venue}
        requirements={event.requirements}
        solution={event.solution}
        hoveredGroup={hoveredGroup}
        refreshEvent={eventFetcher.refresh} />}
  </>
}

export default App;
