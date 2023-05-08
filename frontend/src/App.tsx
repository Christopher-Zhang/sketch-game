import React, { useState } from 'react';
import GameManager from './Components/GameManager';

function App() {
    const urlParams = new URLSearchParams(window.location.href);
    let initialGameId = urlParams.get('gameId') || -1;
    const [gameId, setGameId] = useState(Number(initialGameId));
    const [username, setUsername] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [gameIdInput, setGameIdInput] = useState(-1);

    

    const handleSubmitKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setUsername(usernameInput);
            setGameId(gameId >= 0 ? gameId : gameIdInput);
        }
    }

    const handleSubmitClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setUsername(usernameInput);
        setGameId(gameId >= 0 ? gameId : gameIdInput);
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
            <div className='grid place-content-center min-w-screen min-h-screen'>
                <div className="flex-col w-64 border-2 border-black p-4 mb-64" id='join-input-box'>
                    <label htmlFor="username-input">Username:</label>
                    <input
                        id="username-input"
                        type="text"
                        className="border-2 w-full"
                        placeholder='username'
                        value={usernameInput}
                        onChange={(event) => {setUsernameInput(event.target.value)}}
                        onKeyDown={(event) => handleSubmitKey(event)}
                    ></input>
                    {
                        gameId >= 0 ? <></> :
                        (
                            <React.Fragment>
                                <label htmlFor="gameid-input">Game ID:</label>
                                <input
                                    id="gameid-input"
                                    type="text"
                                    inputMode='numeric'
                                    pattern='[0-9]'
                                    className="border-2 w-full"
                                    placeholder='game ID'
                                    value={gameIdInput}
                                    onChange={(event) => {setGameIdInput(Number(event.target.value))}}
                                    onKeyDown={(event) => handleSubmitKey(event)}
                                ></input>
                            </React.Fragment>
                        )
                            
                        
                    }
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
                        onClick={(event) => handleSubmitClick(event)}>Create Game</button>
                </div>

            </div>

        )
    }

}

export default App;
