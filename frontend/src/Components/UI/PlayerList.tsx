import React from 'react'

type Props = {
    playerList: Array<string>
}

function PlayerList(props: Props) {
    const playerList = [...props.playerList].sort();
    console.log("list of players: ", playerList);
    return (
        <div>
            <div className='text-lg font-bold px-2'>Player List</div>
            {props.playerList.map(
                (e, i) => {
                    // TODO add hover for timestamp or show timestamp option
                    // TODO use a variable for the colors
                    let style = {
                        backgroundColor: i % 2 === 0 ? 'Gainsboro': 'White'
                    };
                    return (
                        <div style={style} className='py-1 px-2' key={`player-${i}`}>
                            {e}
                        </div>
                    )
                }
            )}
        </div>
    );
}

export default PlayerList