import React, { useEffect, useRef, useState } from 'react'
import { Colors } from '../../constants/enums';

type Props = {
    // registerCanvasClearer: Function,
    // registerLineColorPicker: Function,
    // registerToolPicker: Function,
    // registerBackgroundColorPicker: Function,
    // lineColor: Colors,
    // backgroundColor: Colors,
    // doClearCanvas: boolean,
};

function GameCanvas(props: Props) {
    const ctx: React.MutableRefObject<CanvasRenderingContext2D|null> = useRef(null);
    const canvas: React.MutableRefObject<HTMLCanvasElement|null> = useRef(null);
    const canvasOffsetX = useRef(0);
    const canvasOffsetY = useRef(0);
    const canvasWidth = useRef(0);
    const canvasHeight = useRef(0);
    const [isPainting, setIsPainting] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [lineColor, setLineColor] = useState(Colors.Black);
    const [backgroundColor, setBackgroundColor] = useState(Colors.White);

    const setCanvasDimensions = () => {
        console.log("resetting");
        if (!canvas.current) {
            console.error("ERROR COULD NOT FIND CANVAS");
            return;
        }

        // fix the stretch by CSS
        console.log(`OLD: width ${(canvas.current as HTMLCanvasElement).width} height ${(canvas.current as HTMLCanvasElement).height}`);
        // let adjustedWidth = (canvas.current as HTMLCanvasElement).height * ((canvas.current as HTMLCanvasElement).clientWidth / (canvas.current as HTMLCanvasElement).clientHeight);
        // let adjustedHeight = (canvas.current as HTMLCanvasElement).width * ((canvas.current as HTMLCanvasElement).clientHeight / (canvas.current as HTMLCanvasElement).clientWidth);
        let adjustedWidth = canvas.current?.parentElement?.clientWidth as number;
        let adjustedHeight = canvas.current?.parentElement?.clientHeight as number;
        let scaleX = adjustedWidth / (canvas.current as HTMLCanvasElement).width;
        let scaleY = adjustedHeight / (canvas.current as HTMLCanvasElement).height;
        console.log(`scalex: ${scaleX} scaley: ${scaleY}`);
        ctx.current?.scale(scaleX, scaleY);
        let image = (ctx.current?.getImageData(0, 0, (canvas.current as HTMLCanvasElement).width, (canvas.current as HTMLCanvasElement).height));

        (canvas.current as HTMLCanvasElement).width = adjustedWidth;
        (canvas.current as HTMLCanvasElement).height = adjustedHeight;
        console.log(`NEW width ${adjustedWidth} height ${adjustedHeight}`);
        canvasOffsetX.current = (canvas.current as HTMLCanvasElement).offsetLeft;
        canvasOffsetY.current = (canvas.current as HTMLCanvasElement).offsetTop;
        canvasWidth.current = (canvas.current as HTMLCanvasElement).width;
        canvasHeight.current = (canvas.current as HTMLCanvasElement).height;
        // console.log(`left: ${canvasOffsetX.current}, top: ${canvasOffsetY.current}`);
        // console.log(`w: ${canvasWidth.current}, h: ${canvasHeight.current}`);
        ctx.current?.putImageData(image as ImageData, 0, 0);
    };

    const clearCanvas = () => {
        if (!canvas || !ctx) {
            console.error("COULD NOT FIND CANVAS")
            return;
        }
        // (ctx.current as CanvasRenderingContext2D).clearRect(0, 0, (canvas.current as HTMLCanvasElement).width, (canvas.current as HTMLCanvasElement).height);
        ctx.current?.clearRect(0, 0, (canvas.current as HTMLCanvasElement).width, (canvas.current as HTMLCanvasElement).height);
        console.log("Cleared canvas!");
        // context.clearRect(0, 0, canvas.width, canvas.height);
    };


    let lineWidth = 2;

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        if (lineX < 0 || lineX > canvasWidth.current || lineY < 0 || lineY > canvasHeight.current) return;
        setIsPainting(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
        // ctx.current?.beginPath();
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if(!isPainting) return;
        console.log("painting");
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        (ctx.current as CanvasRenderingContext2D).lineWidth = lineWidth;
        (ctx.current as CanvasRenderingContext2D).lineCap = "round";
        (ctx.current as CanvasRenderingContext2D).lineTo(lineX, lineY);
        (ctx.current as CanvasRenderingContext2D).stroke();
        // console.log(`clientX: ${e.clientX}, clientY: ${e.clientY}`);
        // console.log(`pageX: ${e.pageX}, pageY: ${e.pageY}`);
        // console.log(`lineX: ${lineX}, lineY: ${lineY}`);

    };
    const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
 
        setIsPainting(false);
        if (!isPainting) return;
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        (ctx.current as CanvasRenderingContext2D).lineTo(lineX, lineY);
        (ctx.current as CanvasRenderingContext2D).stroke();
        (ctx.current as CanvasRenderingContext2D).beginPath();
    }
    useEffect(() => {
        let foundCanvas = document.getElementById('game-canvas');
        canvas.current = foundCanvas as HTMLCanvasElement;
        ctx.current = (canvas.current as HTMLCanvasElement).getContext("2d");
        setCanvasDimensions();
        window.addEventListener("resize", setCanvasDimensions);
        // props.registerBackgroundColorPicker(setBackgroundColor);
        // props.registerCanvasClearer(clearCanvas);
        // props.registerLineColorPicker(setLineColor);
    }, []);

    // props.registerToolPicker();
    const colors = Object.values(Colors);
    return (
        <div className='game-canvas-container flex flex-col h-[120%]'>
            <div className='border-2 border-black'>
                <canvas 
                    id='game-canvas'
                    onMouseDown={e => handleMouseDown(e)} 
                    onMouseMove={e => handleMouseMove(e)}
                    onMouseUp=  {e => handleMouseUp(e)}
                    onMouseOut= {e => handleMouseUp(e)}
                    className='game-canvas w-full' 
                ></canvas>

            </div>
            <div className='game-toolbar mx-auto mt-2'>
                {buildColorPalette(colors)}
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={clearCanvas}>Clear</button>
            </div>
        </div>
    );
}

function buildColorPalette(colors: Array<string>) {
    // TODO implement
    return (
        <div className='color-palette'>
            {colors.map((color: string) => {
                color = color.toLowerCase();
                console.log("Color: ", color);
                let cname = `w-8 h-8 bg-${color}-400`;
                return <div className={cname}></div>;
            })}
        </div>
    )
}
export default GameCanvas;