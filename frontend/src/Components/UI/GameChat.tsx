import React, { useState } from 'react';
import "./GameChat.css";
import ChatDisplay from './ChatDisplay';

type Props = {}

function GameChat({ }: Props) {
    const [chatInput, setChatInput] = useState("");
    const [chat, setChat] = useState([""]);
    // const handleChatSubmit: Function = (submitEvent: SubmitEvent) => {
    //     setChat(submitEvent.submitter.value)
    // }
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
