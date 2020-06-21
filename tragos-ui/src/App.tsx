import React, { useEffect, useState, SetStateAction, Dispatch, useCallback } from 'react';
import { BrowserRouter as Router, Switch, Route, useParams, useRouteMatch } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import 'font-awesome/css/font-awesome.min.css';

import './App.css';

import { TopBar } from './TopBar';
import { SidePanel } from './SidePanel';
import { StatsView } from './StatsView';
import { useFetch } from './FetchReducer';
import { Event, Venue, Group, Seat } from './Models';
import { ToolBar } from './ToolBar';
import { VenueMap } from './VenueMap';
import { FormAddGroup } from './GroupForms';

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
  let match = useRouteMatch();

  const eventFetcher = useFetch<Event>(`/events/${id}`)
  const event = eventFetcher.state.data;

  const venueFetcher = useFetch<Venue>(null);
  const venue = venueFetcher.state.data;

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [hoveredGroup, setHoveredGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // not sure we need this
  const [groupOfSelectedSeat, setGroupOfSelectedSeat] = useState<Group | null>(null);

  useEffect(() => {
    eventFetcher.setUrl(`/events/${id}`)
  }, [id])


  useEffect(() => {
    if (event) {
      venueFetcher.setUrl(`/venues/${event.venue_id}`)
    }
    else {
      venueFetcher.setUrl(null)
    }
  }, [event])


  useEffect(() => {
    if (!event) {
      props.setTitle(undefined)
    }
    else {
      const date = new Date(Date.parse(event.show_date))
      props.setTitle(`${event.name} ${date.toLocaleDateString('fr-FR')}`)
    }
  }, [event, props])

  useEffect(() => {
    if (event && event.solution && selectedSeat) {
      const seatSolution = event.solution.grid[selectedSeat.row_n][selectedSeat.seat_n]
      if (seatSolution.group_n != null) {
        setGroupOfSelectedSeat(event.requirements.group_queue[seatSolution.group_n])
      }
    }
  }, [props, selectedSeat])

  return <>
    {/* <div style={{position: "absolute", top: "200px"}}>
    <p>{ data ? data.name : "" }</p>
    <p>{ isError ? "error" : "" }</p>
    <p>{ isLoading ? "loading" : "" }</p>
    </div> */}
    <SidePanel group_queue={event?.requirements.group_queue || []}
      setHoveredGroup={setHoveredGroup}
      selectedGroup={selectedGroup}
      setSelectedGroup={setSelectedGroup}
      solution={event?.solution || null}
    />
    {event && venue &&
      <div className="main-panel">
        <ToolBar event={event} refreshEvent={eventFetcher.refresh} />
        <div className="main-panel-info">
          <Switch>
            <Route path={`${match.path}/add_group`}>
              <FormAddGroup refreshEvent={eventFetcher.refresh} />
            </Route>
            <Route path={match.path}>
              <></>
            </Route>
          </Switch>
          <StatsView event={event} solution={event.solution} venue={venue} />
        </div>
        <div className="main-panel-map">
          <VenueMap venue={venue}
            requirements={event.requirements} solution={event.solution}
            hoveredGroup={hoveredGroup} selectedGroup={selectedGroup}
            selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat}
          ></VenueMap>
        </div>
      </div>}
  </>
}

export default App;
