import React, { useState } from 'react';
import GameManager from './Components/GameManager';
import { URLSearchParams } from 'url';

function App() {
    const [gameId, setGameId] = useState(-1);
    const [username, setUsername] = useState("");
    const [usernameInput, setUsernameInput] = useState("");

    const urlParams = new URLSearchParams(window.location.href);
    const handleSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setUsername(usernameInput);
        }
    }
    if (username) {
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
                    <input
                        type="text"
                        className="chatInputArea border-2 w-full"
                        placeholder='enter chat message...'
                        value={usernameInput}
                        onChange={(event) => {setUsernameInput(event.target.value)}}
                        onKeyDown={(event) => handleSubmit(event)}
                    ></input>
                </div>
            </div>
        )
    }

}

export default App;
