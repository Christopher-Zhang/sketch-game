import React from 'react';
import GameCanvas from './GameCanvas/GameCanvas';
import GameChat from './UI/GameChat';

type Props = {}

function GameContainer({ }: Props) {
    
    return (
        <div className='GameContainer justify-center'>
            <GameCanvas />
            <GameChat />
        </div>
    );
}

export default GameContainer;