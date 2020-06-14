import React from 'react';
import Flatbush from 'flatbush';
import { FullParentSizeCanvas } from './Canvas';
import { Venue, Seat } from './Models';

export interface VenueMapProps {
    venue: Venue
    seats: Seat[]
}

export function VenueMap(props: VenueMapProps) {

    const canvasRef = React.createRef<HTMLCanvasElement>();
    const drawerRef = React.useRef<VenueMapDrawer | null>(null);
    const lastCanvasDimension = React.useRef<{ h: number; w: number; } | null>(null);
    const [selected, setSelected] = React.useState<Seat | null>(null);


    function withDrawer<T extends any[] | []>(
        f: (arg0: VenueMapDrawer, ...args: T) => void, ...args: T) {

        return withCanvas(canvas => {

            console.log("toto");
            if (drawerRef.current === null
                || lastCanvasDimension.current?.h !== canvas.height
                || lastCanvasDimension.current?.w !== canvas.width) {

                console.log("tata");
                lastCanvasDimension.current = { h: canvas.height, w: canvas.width };
                drawerRef.current = new VenueMapDrawer(props.venue, props.seats, canvas, selected?.name);
            }

            return f(drawerRef.current, ...args);
        });
    }

    // convert windows coordinates into canvas coordinates
    function getCursorPosition(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): { x: number; y: number; } {
        const canvas = canvasRef.current;
        if (!canvas)
            throw Error("canvas ref is null");

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    function withCanvas<T extends any[] | []>(
        f: (arg0: HTMLCanvasElement, ...args: T) => void, ...args: T) {
        const canvas = canvasRef.current;
        if (canvas === null)
            return;
        const ctx = canvas.getContext('2d');
        if (ctx === null)
            return;
        f(canvas, ...args);
    }

    function handleDraw() {
        withDrawer(drawer => drawer.draw());
    }

    function handleClick(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        withDrawer(drawer => {
            const { x, y } = getCursorPosition(event);
            const seat = drawer.pixel2Seat(x, y);
            if (seat !== null) {
                setSelected(seat);
                drawer.setSelected(seat.name);
            }
            else {
                setSelected(null);
                drawer.setSelected(null);
            }

            drawer.draw();
        });
    }

    return (
        <FullParentSizeCanvas ref={canvasRef} onClick={handleClick} draw={handleDraw} />
    );
}



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
        private selected: string | null = null
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

            if (seat.name === this.selected) {
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

    setSelected(name: string | null) {
        this.selected = name
    }

    draw() {
        console.log("drawing")
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawSeats()
    }
}