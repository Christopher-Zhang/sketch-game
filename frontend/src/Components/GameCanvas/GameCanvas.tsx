import React, { useEffect, useRef, useState } from 'react'
import { Colors, LineWidth } from '../../constants/enums';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { ReadyState } from 'react-use-websocket';
import { clearCanvas, setCanvasDimensions } from '../../utils/canvas';
import { CanvasMessage, MessageEnvelope } from '../../constants/types';

type Props = {
    sendJsonMessage: SendJsonMessage,
    lastMessage: MessageEnvelope,
    readyState: ReadyState,
    activePlayer: boolean,
    userId: number,
    gameId: number
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
    const [lineWidth, setLineWidth] = useState(LineWidth.THIN);
    const [currentTool, setCurrentTool] = useState();
    const [backgroundColor, setBackgroundColor] = useState(Colors.White);

    const _setCanvasDimensions = () => {
        [canvasOffsetX.current, canvasOffsetY.current, canvasWidth.current, canvasHeight.current] = 
            setCanvasDimensions(canvas.current as HTMLCanvasElement, ctx.current as CanvasRenderingContext2D);
    };

    const _clearCanvas = () => {
        clearCanvas(canvas.current as HTMLCanvasElement, ctx.current as CanvasRenderingContext2D);
    };

    const broadcast = (lineX: number, lineY: number) => {
        if (!props.activePlayer) return;
        let canvasMessage: CanvasMessage = {
            ts: Date.now(),
            user_id: props.userId,
            game_id: props.gameId,
            color: lineColor,
            line_width: lineWidth,
            start_x: startX === -1 ? lineX : startX,
            start_y: startY === -1 ? lineY : startY,
            line_x: lineX,
            line_y: lineY
        };
        draw(canvasMessage, ctx.current as CanvasRenderingContext2D);
        console.log("broadcasting: %o", canvasMessage);
        let envelope: MessageEnvelope = {
            chat: null,
            canvas: canvasMessage,
            gameState: null,
        };
        props.sendJsonMessage(envelope);
    };

    const draw = (canvasMessage: CanvasMessage, ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.lineWidth = canvasMessage.line_width;
        ctx.strokeStyle = canvasMessage.color;
        ctx.lineCap = "round";
        ctx.moveTo(canvasMessage.start_x, canvasMessage.start_y);
        ctx.lineTo(canvasMessage.line_x, canvasMessage.line_y);
        ctx.stroke();
        setStartX(canvasMessage.line_x);
        setStartY(canvasMessage.line_y);
    };

    const handleColorChange = (e:React.MouseEvent<HTMLButtonElement>) => {
        let id = (e.target as HTMLButtonElement).id;
        let match = id.match(/-(.+)/);
        if (match && match[1]) {
            let str = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            let color = Colors[str as keyof typeof Colors];
            setLineColor(color);
        }
    };

    const handleLineWidthChange = (e:React.MouseEvent<HTMLButtonElement>) => {
        console.log("line width change e: %o", e);
        let id = (e.target as HTMLButtonElement).id;
        let match = id.match(/-(.+)/);
        if (match && match[1]) {
            let str = match[1];
            str = str.charAt(0).toUpperCase() + str.slice(1);
            let width = LineWidth[str as keyof typeof LineWidth]
            // console.log("Setting color to : %o", color);
            setLineWidth(width);
            (ctx.current as CanvasRenderingContext2D).lineWidth = width;
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        if (!props.activePlayer) return;
        (ctx.current as CanvasRenderingContext2D).strokeStyle = lineColor;
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        if (lineX < 0 || lineX > canvasWidth.current || lineY < 0 || lineY > canvasHeight.current) return;
        setIsPainting(true);
        // setStartX(e.clientX);
        // setStartY(e.clientY);
        // ctx.current?.beginPath();
        setStartX(lineX);
        setStartY(lineY);
        // (ctx.current as CanvasRenderingContext2D).moveTo(lineX, lineY);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if(!isPainting || !props.activePlayer) return;
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        broadcast(lineX, lineY);

        // (ctx.current as CanvasRenderingContext2D).strokeStyle = lineColor;
        // console.log("painting");
        // (ctx.current as CanvasRenderingContext2D).lineWidth = lineWidth;
        // (ctx.current as CanvasRenderingContext2D).lineCap = "round";
        // (ctx.current as CanvasRenderingContext2D).lineTo(lineX, lineY);
        // (ctx.current as CanvasRenderingContext2D).stroke();
        // console.log(`clientX: ${e.clientX}, clientY: ${e.clientY}`);
        // console.log(`pageX: ${e.pageX}, pageY: ${e.pageY}`);
        // console.log(`lineX: ${lineX}, lineY: ${lineY}`);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {

        (ctx.current as CanvasRenderingContext2D).strokeStyle = lineColor;
        setIsPainting(false);
        if(!isPainting || !props.activePlayer) return;
        let lineX = e.pageX - canvasOffsetX.current;
        let lineY = e.pageY - canvasOffsetY.current;
        broadcast(lineX, lineY);
        setStartX(-1);
        setStartY(-1);
        // (ctx.current as CanvasRenderingContext2D).lineTo(lineX, lineY);
        // (ctx.current as CanvasRenderingContext2D).stroke();
        // (ctx.current as CanvasRenderingContext2D).beginPath();
    }

    // draw when we get a new message
    useEffect(() => {
        if (!props.lastMessage.canvas) return;

        let canvasMessage: CanvasMessage = props.lastMessage.canvas as CanvasMessage;
        draw(canvasMessage, ctx.current as CanvasRenderingContext2D);
    }, [props.lastMessage.canvas, props.lastMessage.canvas?.ts]);
    
    useEffect(() => {
        let foundCanvas = document.getElementById('game-canvas');
        canvas.current = foundCanvas as HTMLCanvasElement;
        ctx.current = (canvas.current as HTMLCanvasElement).getContext("2d");
        _setCanvasDimensions();
        window.addEventListener("resize", _setCanvasDimensions);
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
            <div className='game-toolbar mx-auto mt-2 flex flex-row justify-start'>
                
                <div className='line-width mx-5 flex flex-row content-center m-0.5'>
                    {
                        Object.keys(LineWidth).map((width) => {
                            if (!isNaN(Number(width))) return null;
                            let thisWidth = LineWidth[width as keyof typeof LineWidth];
                            let isActive = lineWidth === thisWidth;
                            let domWidth = (thisWidth + 6);
                            let innerStyle = {
                                width: `${domWidth}px`,
                                height: `${domWidth}px`,
                                backgroundColor: 'black',
                                margin: `${(32-domWidth) / 2}px`,
                                // marginLeft: `${(32-domWidth) / 2}px`,
                                // marginRight: `${(32-domWidth) / 2}px`,
                                // marginRight: `${(32-domWidth) / 2}px`,
                                // marginRight: `${(32-domWidth) / 2}px`,
                            };
                            let outlineStyle = {
                                outlineStyle: 'solid',
                                outlineWidth: '2px',
                                outlineColor: 'red',
                                outlineOffset: '2px',
                                backgroundClip: 'content-box'
                            };
                            if (isActive) {
                                innerStyle = {...innerStyle, ...outlineStyle};
                            }
                            return (
                                <button className='rounded-full' style={innerStyle} id={`linewidth-${width}`} onClick={(e) => handleLineWidthChange(e)}></button>
                            );
                        })
                    }
                </div>
                <div className='color-palette flex flex-row'>
                    {colors.map((color: string) => {
                        let isActive = color === lineColor;
                        color = color.toLowerCase();
                        let colorConflicts = ['red', 'magenta'];
                        let activeColor = (colorConflicts.includes(color)) ? 'black' : 'red';
                        let inactiveStyle = {
                            backgroundColor: color,
                            borderStyle: 'solid',
                            borderWidth: '2px',
                            borderColor: 'black'
                        };
                        let activeStyle = {
                            backgroundColor: color,
                            borderStyle: 'dashed',
                            borderWidth: '2px',
                            borderColor: activeColor
                            // backgroundColor: color,
                            // outlineStyle: 'dotted',
                            // outlineWidth: '3px',
                            // // outlineOffset: '1px',
                            // outlineColor: 'red'
                        };

                        return <button onClick={(e) => handleColorChange(e)} id={`changeColor-${color}`} className='w-8 h-8 m-0.5 rounded-md' style={isActive ? activeStyle : inactiveStyle}></button>;
                    })}
                </div>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3' onClick={_clearCanvas}>Clear</button>
            </div>
        </div>
    );
}


    // let palette = [];
    // for(let i = 0; i < colors.length - 1; i+=2) {
    //     let style1 = {
    //         backgroundColor: colors[i],
    //     };
    //     let style2 = {
    //         backgroundColor: colors[i+1]
    //     };
    //     let col = (
    //         <div className='grid-rows-2'>
    //             <div className='row-span-1 w-8 h-8 m-1 border-2 border-black' style={style1}></div>
    //             <div className='row-span-1 w-8 h-8 m-1 border-2 border-black' style={style2}></div>
    //         </div>
    //     );
    //     palette.push(col);
    // }
    // return (
    //     <div className='color-palette'>
    //         {palette}
    //     </div>
    // )
export default GameCanvas;