import React from 'react'

type Props = {};

function GameCanvas({ }: Props) {

    return (
        <div className='GameCanvasContainer'>
            <div>
                <canvas className='GameCanvas border-solid border-2 border-black' width='100vw' height='100vw'></canvas>
            </div>
        </div>
    );
}

export default GameCanvas;