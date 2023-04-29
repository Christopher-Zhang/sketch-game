import React, { useEffect, useState } from 'react';
import GameCanvas from './GameCanvas/GameCanvas';
import ChatInput from './UI/ChatInput';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import PlayerList from './UI/PlayerList';
import ChatHistory from './UI/ChatHistory';
import { ChatHistoryEntry, ChatMessage, GameStateMessage, MessageEnvelope } from '../constants/types';

type Props = {
    gameId: number,
    username: string,
}
const EMPTY_MESSAGE_ENVELOPE: MessageEnvelope = {
    chat: null,
    canvas: null,
    game_state: null
};
const EMPTY_CHAT_HISTORY: Array<ChatHistoryEntry> = [];

function GameManager(props: Props) {
    const [socketUrl, setSocketUrl] = useState("");
    const [chatHistory, setChatHistory] = useState(EMPTY_CHAT_HISTORY);
    const [playerList, setPlayerList] = useState([""]);
    const [userId, setUserId] = useState(Math.floor(Math.random() * 100));
    const [username, setUsername] = useState(props.username);
    const [gameId, setGameId] = useState(props.gameId);
    const [lastMessageJson, setLastMessageJson] = useState(EMPTY_MESSAGE_ENVELOPE);

    const {sendJsonMessage, lastMessage}= useWebSocket(
        socketUrl, {
            onOpen: () => {
                console.log(`Connected to ${socketUrl}!`);
            },
            shouldReconnect: closeEvent => false,
            share: true,
        }
    );

    useEffect(() => {
        if (!lastMessage) {
            return;
        }
        // console.log("Message: %o", JSON.stringify(lastJsonMessage));
        // console.log("Raw Message: ", lastMessage);
        console.log(lastMessage.data);
        let lastMessageJson: MessageEnvelope = JSON.parse(lastMessage.data);
        if (lastMessageJson.chat) {
            let chat = lastMessageJson.chat as ChatMessage;
            let newChatEntry: ChatHistoryEntry = {
                ts: chat.ts,
                username: chat.username,
                message: chat.message
            };
            setChatHistory(prev => [...prev, newChatEntry]);
        }
        
        // playerlist
        if (lastMessageJson.game_state) {
            let gameState = lastMessageJson.game_state as GameStateMessage;
            setPlayerList(gameState.player_list);
        }
        setLastMessageJson(lastMessageJson);
    },[lastMessage]);


    useEffect(() => {
        let body = {"username": "keypup", "user_id": userId, "game_id": 1};
        registerWebsocket(body, setSocketUrl);
    }, [userId]);

    return (
        <div className='game-manager grid grid-cols-7 gap-4'>
            <div className='col-span-1 border-2 border-black'>
                <PlayerList 
                    playerList={playerList}
                />
            </div>
            <div className='col-span-4 px-2'>
                <GameCanvas 
                    sendJsonMessage={(e) => {sendJsonMessage(e)}}
                    lastMessage={lastMessageJson}
                    activePlayer={true}
                    userId={userId}
                    username={username}
                    gameId={gameId}
                />
                {/* <button onClick={pickLineColor(Colors.Blue)}>Color</button> */}
                {/* <button onClick={() => clearCanvas()}>Clear</button> */}
            </div>
            <div className='col-span-2 grid-rows-6 px-2 pb-3 border-2 border-black flex flex-col-reverse min-h-[400px]'>
                <ChatInput 
                    sendJsonMessage={(e) => {sendJsonMessage(e)}}
                    lastMessage={lastMessageJson}
                    activePlayer={true}
                    userId={userId}
                    username={username}
                    gameId={gameId}
                />
                <ChatHistory chatHistory={chatHistory} />
            </div>
        </div>
    );
}

function registerWebsocket(body: {}, socketHandler: Function) {
    const opts = {
        headers: {'Content-Type': 'application/json'},
        'body': JSON.stringify(body),
        'method': 'POST',
    };
    console.log("registering socket ");
    fetch("http://localhost:8000/register", opts)
        .then((res) => res.json())
        .then((data) => {socketHandler(data["url"])});
}

export default GameManager;
