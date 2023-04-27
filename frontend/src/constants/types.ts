import { JsonObject } from "react-use-websocket/dist/lib/types"
import { Colors } from "./enums"

export interface RegisterRequestBody {
    username: string,
    user_id: number,
    game_id: number
}

export interface ChatMessage extends JsonObject{
    user_id: number,
    username: string,
    game_id: number,
    message: string
}

export interface CanvasMessage extends JsonObject{
    ts: number,
    user_id: number,
    game_id: number,
    color: Colors,
    line_width: number,
    start_x: number,
    start_y: number,
    line_x: number,
    line_y: number,
}

export interface GameStateMessage extends JsonObject{

}

export interface MessageEnvelope extends JsonObject{
    chat: ChatMessage | null,
    canvas: CanvasMessage | null,
    gameState: GameStateMessage | null,
}