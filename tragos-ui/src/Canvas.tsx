import React from "react";

interface CanvasProps {
    width: number
    height: number
    onClick: ((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void) | undefined
    draw: () => void
}

export const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {

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

export const FullParentSizeCanvas = React.forwardRef<HTMLCanvasElement, FullParentSizeCanvasProps>((props, ref) => {
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

