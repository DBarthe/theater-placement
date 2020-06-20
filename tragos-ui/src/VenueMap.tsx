import React, { useEffect, useMemo } from 'react';
import Flatbush from 'flatbush';
import { FullParentSizeCanvas } from './Canvas';
import { Venue, Seat, Requirements, Solution, SeatStatus } from './Models';
import { assert } from 'console';

export interface VenueMapProps {
    venue: Venue
    requirements: Requirements
    solution: Solution | null
}

export function VenueMap(props: VenueMapProps) {

    const [selected, setSelected] = React.useState<Seat | null>(null);
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const [drawer, setDrawer] = React.useState<VenueMapDrawer|null>(null);
    const [resized, setResized] = React.useState<boolean>(false);

    function rebuildDrawer() {
        if (canvasRef.current) {
           setDrawer(new VenueMapDrawer(props.venue, props.requirements, props.solution, canvasRef.current, selected));
        }
    }

    useEffect(() => {
        rebuildDrawer()
    }, [props.venue, props.requirements, props.solution]);

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

    function handleDraw() {
        // withDrawer(drawer => drawer.draw());
        if (drawer === null || resized) {
            rebuildDrawer()
            setResized(false)
        }

        else {
            drawer.draw();
        }
    }

    function handleResize() {
        setResized(true);
    }

    function handleClick(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        // withDrawer(drawer => {
            if (drawer === null) return ;
            const { x, y } = getCursorPosition(event);
            const seat = drawer.pixel2Seat(x, y);
            if (seat !== null) {
                setSelected(seat);
                drawer.setSelected(seat);
            }
            else {
                setSelected(null);
                drawer.setSelected(null);
            }

            handleDraw()
        // });
    }

    return (
        <FullParentSizeCanvas ref={canvasRef} onClick={handleClick} draw={handleDraw} onResize={handleResize} />
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

    private seats: Seat[];

    private boxesIndex: { [index: string]: BoundingBox };
    private spatialIndex: Flatbush;


    constructor(
        private venue: Venue,
        private requirements: Requirements,
        private solution: Solution | null,
        private canvas: HTMLCanvasElement,
        private selected: Seat | null = null
    ) {

        console.log("recomputing drawer")

        const ctx = this.canvas.getContext('2d')
        if (ctx == null) throw Error("No canvas 2D context")
        this.ctx = ctx;

        this.ratioTranslation = Math.min(canvas.width / venue.width, canvas.height / venue.height)
        this.offsetX = canvas.width - venue.width * this.ratioTranslation
        this.offsetY = canvas.height - venue.height * this.ratioTranslation

        this.seats = venue.rows.flatMap(row => row.seats);

        const [boxesIndex, spatialIndex] = this.computeIndexes()
        this.boxesIndex = boxesIndex
        this.spatialIndex = spatialIndex
    }

    private seatBoundingBox(seat: Seat): BoundingBox {
        const { x, y } = this.position2Pixel(seat.x, seat.y)
        const width = this.size2Pixels(this.venue.default_seat_width)
        const height = this.size2Pixels(this.venue.default_seat_height)

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
        const boxesIndex: { [index: string]: BoundingBox } = {}
        const spatialIndex = new Flatbush(this.seats.length)
        for (const seat of this.seats) {
            const boundingBox = this.seatBoundingBox(seat)
            boxesIndex[[seat.row_n, seat.seat_n].toString()] = boundingBox
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
            const box = this.boxesIndex[[seat.row_n, seat.seat_n].toString()]
            let selected = false;

            if (seat.row_n === this.selected?.row_n && seat.seat_n === this.selected?.seat_n) {
                selected = true;
            }

            const [x, y, w, h] = [Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h)]

            this.ctx.fillStyle = "green";
            this.ctx.fillRect(x, y, w, h)

            if (selected) {
                this.ctx.strokeStyle = "white"
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x, y, w, h)
            }

            // seat name
            this.ctx.textAlign = "start";
            this.ctx.textBaseline = 'top';
            this.ctx.font = `${w / 3}px Arial`;
            this.ctx.fillStyle = "white";
            this.ctx.fillText(seat.row_name + seat.col_name, x + 2, y + 2);

            if (this.solution) {

                const seat_solution = this.solution.grid[seat.row_n][seat.seat_n]

                if (seat_solution.status === SeatStatus.OCCUPIED) {
                    //seat occupied
                    this.ctx.font = `${w / 2}px FontAwesome`;
                    this.ctx.fillStyle = "white";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('\uF007', Math.round(x + w / 2), Math.round(y + h / 2));

                    if (seat_solution.group_n === null) {
                        throw new Error("inconsitent state : seat_solution has no group_n")
                    }
                    const group = this.requirements.group_queue[seat_solution.group_n];

                    if (group.slot !== null) {
                        // seat locked
                        this.ctx.font = `${w / 2}px FontAwesome`;
                        this.ctx.fillStyle = "white";
                        this.ctx.textAlign = "end";
                        this.ctx.textBaseline = 'bottom';
                        this.ctx.fillText('\uF023', Math.round(x + w), Math.round(y + h));
                    }

                }
                else if (seat_solution.status === SeatStatus.BLOCKED) {
                    // seat blocked
                    this.ctx.font = `${w / 2}px FontAwesome`;
                    this.ctx.fillStyle = "white";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('\uF05e', Math.round(x + w / 2), Math.round(y + h / 2));
                }
            }

            if (seat.accessible) {
                // seat accessible
                this.ctx.font = `${w / 2}px FontAwesome`;
                this.ctx.fillStyle = "white";
                this.ctx.textAlign = "start";
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText('\uF193', Math.round(x), Math.round(y + h));
            }
        })
    }

    pixel2Seat(x: number, y: number): Seat | null {
        const matches = this.spatialIndex.search(x, y, x, y);
        return matches.length === 0 ? null : this.seats[matches[0]];
    }

    setSelected(seat: Seat | null) {
        this.selected = seat
    }

    draw() {
        console.log("drawing")
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawSeats()
    }
}