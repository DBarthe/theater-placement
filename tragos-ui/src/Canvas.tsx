import React, { useEffect } from "react";

interface CanvasProps {
    width: number
    height: number
    onClick: ((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void) | undefined
}

export const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {

    const { width, height, onClick } = props; 

    return (
        <canvas ref={ref} width={width} height={height} onClick={onClick}></canvas>
    );
});

interface FullParentSizeCanvasProps {
    onClick: ((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void) | undefined
    dimension: {w: number, h: number}
    setDimension: (dim: {w: number, h: number}) => any
}

export const FullParentSizeCanvas = React.forwardRef<HTMLCanvasElement, FullParentSizeCanvasProps>((props, ref) => {


    const {onClick, dimension, setDimension } = props;
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    function resizeCanvas() {
        if (wrapperRef.current === null) return;

        const newWrapperSize = {
            w: wrapperRef.current.clientWidth,
            h: wrapperRef.current.clientHeight
        };

        setDimension(newWrapperSize)
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
    }, [setDimension])  // [] means only once

    return (
        <div ref={wrapperRef} style={{ backgroundColor: "skyblue", height: "100%", width: "100%" }}>
            <Canvas ref={ref} width={dimension.w} height={dimension.h} onClick={onClick}/>
        </div>
    )
});

