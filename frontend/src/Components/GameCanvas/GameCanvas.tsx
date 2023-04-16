import React, { useEffect, useRef, useState } from 'react'

type Props = {};

function GameCanvas({ }: Props) {
    const ctx: React.MutableRefObject<CanvasRenderingContext2D|null> = useRef(null);
    const canvasOffsetX = useRef(0);
    const canvasOffsetY = useRef(0);
    const canvasWidth = useRef(0);
    const canvasHeight = useRef(0);
    const [isPainting, setIsPainting] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    useEffect(() => {
        let canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error("ERROR COULD NOT FIND CANVAS");
        }

        ctx.current = (canvas as HTMLCanvasElement).getContext("2d");
        canvasOffsetX.current = (canvas as HTMLCanvasElement).offsetLeft;
        canvasOffsetY.current = (canvas as HTMLCanvasElement).offsetTop;
        canvasWidth.current = (canvas as HTMLCanvasElement).width;
        canvasHeight.current = (canvas as HTMLCanvasElement).height;
    }, []);
    let lineColor = "black";
    let lineWidth = 2;

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        setIsPainting(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if(!isPainting) {
            return;
        }
        let lineX = e.clientX - canvasOffsetX.current;
        let lineY = e.clientY;

        console.log(`lineX: ${lineX}, lineY: ${lineY}`);
        (ctx.current as CanvasRenderingContext2D).lineWidth = lineWidth;
        // (ctx.current as CanvasRenderingContext2D).
        (ctx.current as CanvasRenderingContext2D).lineCap = "round";
        (ctx.current as CanvasRenderingContext2D).lineTo(lineX, lineY);
        (ctx.current as CanvasRenderingContext2D).stroke();

    };
    const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
        setIsPainting(false);
        (ctx.current as CanvasRenderingContext2D).stroke();
        (ctx.current as CanvasRenderingContext2D).beginPath();
    }


    return (
        <div className='GameCanvasContainer'>
            <div>
                <canvas 
                    id='game-canvas'
                    onMouseDown={e => handleMouseDown(e)} 
                    onMouseMove={e => handleMouseMove(e)}
                    onMouseUp=  {e => handleMouseUp(e)}
                    className='GameCanvas w-full h-full' 
                ></canvas>
            </div>
        </div>
    );
}

export default GameCanvas;