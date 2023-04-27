import { JsonObject } from "react-use-websocket/dist/lib/types"
import { Colors } from "./enums"

export interface RegisterRequestBody {
    username: string,
    user_id: number,
    game_id: number
}

export interface ChatMessage {
    user_id: number,
    username: string,
    game_id: number,
    message: string
}

export interface CanvasAction {

}

export interface CanvasMessage extends JsonObject{
    userId: number,
    gameId: number,
    color: Colors,
    lineWidth: number,
    startX: number,
    startY: number,
    lineX: number,
    lineY: number,
}

export interface GameStateMessage {

}

export interface MessageEnvelope {
    chat: ChatMessage | null,
    canvas: CanvasMessage | null,
    game_state: GameStateMessage | null,
}