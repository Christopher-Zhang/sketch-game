import React, { useState } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import "./GameChat.css";
import ChatDisplay from './ChatDisplay';

type Props = {}

function GameChat({ }: Props) {
    const socketUrl = ''; //TODO add
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
                message: "testing!",
                
            }
            sendJsonMessage(message);
            console.debug(`Sending ${message}`);
        }
    }
    return (
        <div className='chatContainer columns-1'>
            <ChatDisplay />
            <div className='chatInputBox border-2 w-full'>
                <input type='text' className='chatInputArea'></input>
            </div>
        </div>
    );
}

export default GameChat;
