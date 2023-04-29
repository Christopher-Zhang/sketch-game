import React, { useEffect, useState } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import ChatHistory from './ChatHistory';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { ChatMessage, MessageEnvelope } from '../../constants/types';

type Props = {
    sendJsonMessage: SendJsonMessage,
    lastMessage: MessageEnvelope,
    activePlayer: boolean,
    userId: number,
    username: string,
    gameId: number
};

function ChatInput(props: Props) {
    const [chatInput, setChatInput] = useState("");
    
    const handleChatSubmit: Function = (submitEvent: React.KeyboardEvent<HTMLInputElement>) => {
        if(submitEvent.key === 'Enter') {
            // submitEvent.target.
            let cm: ChatMessage = {
                ts: Date.now(),
                user_id: props.userId,
                username: props.username,
                game_id: props.gameId,
                message: chatInput,
            };
            let me: MessageEnvelope = {
                chat: cm,
                canvas: null,
                game_state: null,
            }
            console.log(`Sending %o`, me);
            props.sendJsonMessage(me);
            setChatInput("");
        }
    };
    const handleChatInput: Function = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        let val = changeEvent.target.value;
        console.log(val);
        setChatInput(val);
    };

    return (
    <div className="chatInputBox row-span-1 w-full">
        <input
            type="text"
            className="chatInputArea border-2 w-full"
            placeholder='enter chat message...'
            value={chatInput}
            onChange={(event) => handleChatInput(event)}
            onKeyDown={(event) => handleChatSubmit(event)}
        ></input>
    </div>
    );
}

export default ChatInput;