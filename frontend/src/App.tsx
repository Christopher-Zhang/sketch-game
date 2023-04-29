import React, { useState } from 'react';
import GameManager from './Components/GameManager';

function App() {
    const [gameId, setGameId] = useState(-1);
    const [username, setUsername] = useState("");
    if (gameId && username) {
        return (
            <div className="app-wrapper p-2">
                <GameManager 
                    gameId={gameId}
                    username={username}
                />
            </div>
        );
    }
    else {
        return (
            <div className='place-content-center'>
                <div id='join-input-box'>
                    {/* <input
                        type="text"
                        className="chatInputArea border-2 w-full"
                        placeholder='enter chat message...'
                        value={chatInput}
                        onChange={(event) => handleChatInput(event)}
                        onKeyDown={(event) => handleChatSubmit(event)}
                    ></input> */}
                </div>
            </div>
        )
    }

}

export default App;
