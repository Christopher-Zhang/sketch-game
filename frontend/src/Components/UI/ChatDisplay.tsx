import React from 'react';

type Props = {
    chatHistory: Array<string>
};

function ChatDisplay(props: Props) {
    const chatHistory = [...props.chatHistory];
    chatHistory.reverse();
    console.log(chatHistory);
    return (
        <div className='row-span-5 flex flex-col-reverse'>
            {chatHistory.map(
                e => <div>{e}</div>
            )}
        </div>
    );
}

export default ChatDisplay;