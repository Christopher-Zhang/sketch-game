import React, { useEffect, useState } from 'react';
import GameCanvas from './GameCanvas/GameCanvas';
import ChatInput from './UI/ChatInput';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import PlayerDisplay from './UI/PlayerDisplay';
import ChatDisplay from './UI/ChatDisplay';

type Props = {}
interface RegisterRequestBody {
    username: string,
    user_id: number,
    game_id: number
}

function GameManager({ }: Props) {
    const [socketUrl, setSocketUrl] = useState("");
    const [chatHistory, setChatHistory] = useState(["message 1", "message 2", "message 3"]);
    const {sendJsonMessage, lastMessage, readyState}= useWebSocket(
        socketUrl, {
            onOpen: () => {
                console.log(`Connected to ${socketUrl}!`);
            },
            shouldReconnect: closeEvent => true,
            share: true,
        }
    );
    useEffect(() => {
        if (!lastMessage) {
            return;
        }
        // console.log("Message: %o", JSON.stringify(lastJsonMessage));
        console.log("Raw Message: ", lastMessage);
        let text = lastMessage?.data;
        setChatHistory((prev) => [...prev, text]);
    },[lastMessage]);


    useEffect(() => {
        let body = {};
        registerWebsocket(body, setSocketUrl);
    }, []);

    return (
        <div className='game-manager grid grid-cols-7 gap-4'>
            <div className='col-span-1 px-2 pb-3 border-2 border-black'><PlayerDisplay /></div>
            <div className='col-span-4 px-2 pb-3 border-2 border-black'><GameCanvas /></div>
            <div className='col-span-2 grid-rows-6 px-2 pb-3 border-2 border-black flex flex-col-reverse'>
                <ChatInput />
                <ChatDisplay chatHistory={chatHistory} />
            </div>
        </div>
    );
}

function registerWebsocket(body: {}, socketHandler: Function) {
    const opts = {
        headers: {'Content-Type': 'application/json'},
        'body': JSON.stringify({"username": "keypup", "user_id": 1, "game_id": 1}),
        'method': 'POST',
    };
    console.log("registering socket ");
    fetch("http://localhost:8000/register", opts)
        .then((res) => res.json())
        .then((data) => {socketHandler(data["url"])});
}

export default GameManager;