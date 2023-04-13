import React, { useEffect, useState } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import "./GameChat.css";
import ChatDisplay from './ChatDisplay';

type Props = {}

function GameChat({ }: Props) {
    // const socketUrl = 'ws://127.0.0.1:8000/ws'; //TODO add
    const [socketUrl, setSocketUrl] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [chat, setChat] = useState([""]);
    const {sendJsonMessage, lastJsonMessage, readyState}= useWebSocket(
        socketUrl, {
            onOpen: () => {
                console.log(`Connected to ${socketUrl}!`);
                // TODO register uuid and stuff
            },
            shouldReconnect: closeEvent => true,
            share: true,
        }
    );
    
    const handleChatSubmit: Function = (submitEvent: KeyboardEvent) => {
        if(submitEvent.key === 'Enter') {
            let message = {
                message: chatInput,
            }
            sendJsonMessage(message);
            console.log(`Sending %o`, message);
        }
    }
    const handleChatInput: Function = (changeEvent: Event) => {
        // @ts-ignore
        let val = changeEvent.target.value;
        console.log(val);
        setChatInput(val);
    }
    const opts = {
        headers: {'Content-Type': 'application/json'},
        'body': JSON.stringify({"username": "keypup", "user_id": 1, "game_id": 1}),
        'method': 'POST',
    };
    useEffect(() => {
        console.log("Effect!");
        fetch("http://localhost:8000/register", opts)
            .then((res) => res.json())
            .then((data) => {setSocketUrl(data["url"])});
    }, []);

    // useEffect(() => {
    //     console.log("Message: %o", lastJsonMessage);
    // },[lastJsonMessage]);
    return (
        <div className='chatContainer columns-1'>
            <ChatDisplay />
            <div className='chatInputBox border-2 w-full'>
                <div>Url: {socketUrl}</div>
                <input type='text' className='chatInputArea' onChange={(event)=>handleChatInput(event)} onKeyDown={(event) => handleChatSubmit(event)}></input>
            </div>
        </div>
    );
}

export default GameChat;