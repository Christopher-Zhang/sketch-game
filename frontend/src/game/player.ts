
class Player {
    playerId: number;
    score: number;

    
    constructor() {
        this.playerId = this.getNewPlayerId();
        this.score = 0;
    }

    getNewPlayerId(): number {
        // TODO implement
        return 0;
    }
}

export default Player;