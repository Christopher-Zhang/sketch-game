import React, { useEffect, useState } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import ChatDisplay from './ChatDisplay';

type Props = {}

function ChatInput({ }: Props) {
    // const socketUrl = 'ws://127.0.0.1:8000/ws'; //TODO add
    // const [socketUrl, setSocketUrl] = useState("");
    const [chatInput, setChatInput] = useState("");
    // const {sendJsonMessage, lastMessage, readyState}= useWebSocket(
    //     socketUrl, {
    //         onOpen: () => {
    //             console.log(`Connected to ${socketUrl}!`);
    //         },
    //         shouldReconnect: closeEvent => true,
    //         share: true,
    //     }
    // );
    
    const handleChatSubmit: Function = (submitEvent: KeyboardEvent) => {
        if(submitEvent.key === 'Enter') {
            let message = {
                user_id: 1,
                username: 'keypup',
                game_id: 1,
                message: chatInput,
            }
            // sendJsonMessage(message);
            console.log(`Sending %o`, message);
        }
    }
    const handleChatInput: Function = (changeEvent: Event) => {
        // @ts-ignore
        let val = changeEvent.target.value;
        console.log(val);
        setChatInput(val);
    }
    // const opts = {
    //     headers: {'Content-Type': 'application/json'},
    //     'body': JSON.stringify({"username": "keypup", "user_id": 1, "game_id": 1}),
    //     'method': 'POST',
    // };
    // useEffect(() => {
    //     console.log("Effect!");
    //     fetch("http://localhost:8000/register", opts)
    //         .then((res) => res.json())
    //         .then((data) => {setSocketUrl(data["url"])});
    // }, []);

    // useEffect(() => {
    //     // console.log("Message: %o", JSON.stringify(lastJsonMessage));
    //     console.log("Raw Message: ", lastMessage);
    //     let text = lastMessage?.data;
    //     setChat((prev) => [...prev, text]);
    // },[lastMessage]);
    return (
    <div className="chatInputBox row-span-1 w-full">
        <input
            type="text"
            className="chatInputArea border-2 w-full"
            placeholder='enter chat message...'
            onChange={(event) => handleChatInput(event)}
            onKeyDown={(event) => handleChatSubmit(event)}
        ></input>
    </div>
    );
}

export default ChatInput;