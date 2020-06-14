import React, {  } from 'react';

import { Button, Navbar, NavbarGroup, NavbarDivider, Classes, Icon, MenuItem, Divider, ButtonGroup, Switch as BpSwitch, RadioGroup, Radio, Popover, ControlGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { BrowserRouter as Router, Link } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './App.css';
import Flatbush from 'flatbush';

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
            return query.trim() === "" || item.toLowerCase().indexOf(query.toLowerCase()) !== -1
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
    </div>
  )
}


interface Seat {
  name: string
  x: number
  y: number
}

interface Venue {
  height: number
  width: number
  defaultSeatWidth: number
  defaultSeatHeight: number
}

interface VenueMapProps {
  venue: Venue
  seats: Seat[]
}

const VENUE: Venue = {
  width: 5,
  height: 6,
  defaultSeatHeight: 0.8,
  defaultSeatWidth: 0.8
}

const SEATS: Seat[] = [
  { name: "A1", x: 1, y: 1 },
  { name: "A2", x: 2, y: 1 },
  { name: "A3", x: 3, y: 1 },
  { name: "A4", x: 4, y: 1 },
]

function MainPanel() {
  return (
    <div className="main-panel">
      <ToolBar />
      <div className="main-panel-info">
        <p>sdsqsd</p>
      </div>
      <div className="main-panel-map">
        <VenueMap venue={VENUE} seats={SEATS}></VenueMap>
      </div>
    </div>
  )
}


interface CanvasProps {
  width: number
  height: number
  onClick: ((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void) | undefined
  draw: () => void
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {

  React.useEffect(() => {
    props.draw()
  })

  return (
    <canvas ref={ref} width={props.width} height={props.height} onClick={props.onClick}></canvas>
  );
});

interface FullParentSizeCanvasProps {
  onClick: ((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void) | undefined
  draw: () => void
}

const FullParentSizeCanvas = React.forwardRef<HTMLCanvasElement, FullParentSizeCanvasProps>((props, ref) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [wrapperSize, setWrapperSize] = React.useState({ width: 0, height: 0 })

  function resizeCanvas() {
    if (wrapperRef.current === null) return;

    const newWrapperSize = {
      width: wrapperRef.current.clientWidth,
      height: wrapperRef.current.clientHeight
    };

    if (wrapperSize.height === newWrapperSize.height && wrapperSize.width === newWrapperSize.width) return;

    console.log("resizing canvas", newWrapperSize)
    setWrapperSize(newWrapperSize)
  }

  function createDebouncedResizeHandle() {
    let resizeTimer: NodeJS.Timeout;
    return () => {
      clearTimeout(resizeTimer);
      console.log("handle resize", resizeTimer)
      resizeTimer = setTimeout(resizeCanvas, 250);
    }
  }

  React.useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', createDebouncedResizeHandle())
  }, [])  // [] means only once

  return (
    <div ref={wrapperRef} style={{ backgroundColor: "skyblue", height: "100%", width: "100%" }}>
      <Canvas ref={ref} width={wrapperSize.width} height={wrapperSize.height} {...props} />
    </div>
  )
});

interface BoundingBox {
  x: number
  y: number
  h: number
  w: number
}

class VenueMapDrawer {

  private ctx: CanvasRenderingContext2D;

  // the ratio such as venue pos * ratio = canvas pos
  private ratioTranslation: number;

  // the offset to center the map in the middle of the canvas
  private offsetX: number;
  private offsetY: number;

  private boxesIndex: { [name: string]: BoundingBox };
  private spatialIndex: Flatbush;

  constructor(
    private venue: Venue,
    private seats: Seat[],
    private canvas: HTMLCanvasElement,
    private selected: string|null = null
  ) {

    console.log("recomputing drawer")

    const ctx = this.canvas.getContext('2d')
    if (ctx == null) throw Error("No canvas 2D context")
    this.ctx = ctx;

    this.ratioTranslation = Math.min(canvas.width / venue.width, canvas.height / venue.height)
    this.offsetX = canvas.width - venue.width * this.ratioTranslation
    this.offsetY = canvas.height - venue.height * this.ratioTranslation
    const [boxesIndex, spatialIndex] = this.computeIndexes()
    this.boxesIndex = boxesIndex
    this.spatialIndex = spatialIndex
  }

  private seatBoundingBox(seat: Seat): BoundingBox {
    const { x, y } = this.position2Pixel(seat.x, seat.y)
    const width = this.size2Pixels(this.venue.defaultSeatWidth)
    const height = this.size2Pixels(this.venue.defaultSeatHeight)

    const cornerX = x - width / 2
    const cornerY = y - height / 2

    return {
      x: Math.round(cornerX),
      y: Math.round(cornerY),
      w: Math.round(width),
      h: Math.round(height)
    }
  }

  private computeIndexes(): [{ [name: string]: BoundingBox }, Flatbush] {
    const boxesIndex: { [name: string]: BoundingBox } = {}
    const spatialIndex = new Flatbush(this.seats.length)
    for (const seat of this.seats) {
      const boundingBox = this.seatBoundingBox(seat)
      boxesIndex[seat.name] = boundingBox
      spatialIndex.add(boundingBox.x, boundingBox.y, boundingBox.x + boundingBox.w, boundingBox.y + boundingBox.h)
    }
    spatialIndex.finish()
    return [boxesIndex, spatialIndex]
  }

  private position2Pixel(x: number, y: number): { x: number, y: number } {
    return {
      x: this.offsetY + x * this.ratioTranslation,
      y: this.offsetY + y * this.ratioTranslation
    }
  }


  private size2Pixels(size: number): number {
    return size * this.ratioTranslation
  }


  private drawSeats() {

    this.seats.forEach((seat) => {
      const box = this.boxesIndex[seat.name]

      if (seat.name == this.selected) {
        this.ctx.fillStyle = 'yellow'
      }
      else {
        this.ctx.fillStyle = 'green'
      }


      this.ctx.fillRect(Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h))
    })
  }

  pixel2Seat(x: number, y: number): Seat | null {
    const matches = this.spatialIndex.search(x, y, x, y);
    return matches.length === 0 ? null : this.seats[matches[0]];
  }

  setSelected(name: string|null) {
    this.selected = name
  }

  draw() {
    console.log("drawing")
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawSeats()
  }
}



function VenueMap(props: VenueMapProps) {

  const canvasRef = React.createRef<HTMLCanvasElement>();
  const drawerRef = React.useRef<VenueMapDrawer | null>(null)
  const lastCanvasDimension = React.useRef<{ h: number, w: number } | null>(null)
  const [selected, setSelected] = React.useState<Seat|null>(null)


  function withDrawer<T extends any[] | []>(
    f: (arg0: VenueMapDrawer, ...args: T) => void, ...args: T) {

    return withCanvas(canvas => {

      console.log("toto")
      if (drawerRef.current === null
        || lastCanvasDimension.current?.h !== canvas.height
        || lastCanvasDimension.current?.w !== canvas.width) {

        console.log("tata")
        lastCanvasDimension.current = { h: canvas.height, w: canvas.width }
        drawerRef.current = new VenueMapDrawer(props.venue, props.seats, canvas, selected?.name);
      }

      return f(drawerRef.current, ...args)
    })
  }

  // convert windows coordinates into canvas coordinates
  function getCursorPosition(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): { x: number, y: number } {
    const canvas = canvasRef.current;
    if (!canvas) throw Error("canvas ref is null")

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x, y }
  }

  function withCanvas<T extends any[] | []>(
    f: (arg0: HTMLCanvasElement, ...args: T) => void, ...args: T) {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    f(canvas, ...args)
  }

  function handleDraw() {
    withDrawer(drawer => drawer.draw())
  }

  function handleClick(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    withDrawer(drawer => {
      const { x, y } = getCursorPosition(event);
      const seat = drawer.pixel2Seat(x, y)
      if (seat !== null) {
        setSelected(seat)
        drawer.setSelected(seat.name)
      }
      else {
        setSelected(null)
        drawer.setSelected(null)
      }

      drawer.draw()
    })
  }

  return (
    <FullParentSizeCanvas ref={canvasRef} onClick={handleClick} draw={handleDraw} />
  )
}

export default App;
