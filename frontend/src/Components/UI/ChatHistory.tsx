import React from 'react';
import { ChatHistoryEntry } from '../../constants/types';

type Props = {
    chatHistory: Array<ChatHistoryEntry>
};

function ChatHistory(props: Props) {
    const chatHistory = [...props.chatHistory];
    chatHistory.reverse();
    // console.log(chatHistory);
    return (
        <div className='row-span-5 flex flex-col-reverse'>
            {chatHistory.map(
                (e, i) => {
                    // TODO add hover for timestamp or show timestamp option
                    // TODO use a variable for the colors
                    let style = {
                        backgroundColor: i % 2 === 0 ? 'Gainsboro': 'White'
                    };
                    return (
                        <span style={style} className='py-1' key={`chat-${i}`}>
                            <b>{e.username}</b>: {e.message}
                        </span>
                    )
                }
            )}
        </div>
    );
}

export default ChatHistory;