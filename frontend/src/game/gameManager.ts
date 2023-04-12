import Player from "./player";

class SketchGame {
    gameId: string;
    players: Array<Player>;
    

    constructor(gameId: string) {
        this.gameId = gameId;
        this.players = [];
    }

    getNewGameId(): string {
        // TODO implement
        return "testid";
    }

    registerGameSocket() {
        // TODO implement
    }

    useChat(onMessage: Function): Function {


        const sendMessage = (message: String) => {
            // TODO implement
        };
        
        return sendMessage;
    }
}

export default SketchGame;