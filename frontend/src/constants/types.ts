import { JsonObject } from "react-use-websocket/dist/lib/types"
import { Colors } from "./enums"

export interface RegisterRequestBody {
    username: string,
    user_id: number,
    game_id: number
}

export interface ChatHistoryEntry extends JsonObject {
    ts: number,
    username: string,
    message: string,
}

export interface ChatMessage extends JsonObject{
    ts: number,
    user_id: number,
    username: string,
    game_id: number,
    message: string
}

export interface CanvasEvent extends JsonObject {
    start_x: number,
    start_y: number,
    line_x: number,
    line_y: number,
}

export interface CanvasMessage extends JsonObject{
    ts: number,
    user_id: number,
    game_id: number,
    color: Colors,
    line_width: number,
    canvas_events: Array<CanvasEvent>
}

export interface GameStateMessage extends JsonObject{
    ts: number,
    player_list: Array<string>,
}

export interface MessageEnvelope extends JsonObject{
    chat: ChatMessage | null,
    canvas: CanvasMessage | null,
    game_state: GameStateMessage | null,
}