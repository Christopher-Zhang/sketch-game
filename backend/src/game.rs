use crate::{Clients, websocket::{ChatMessage, CanvasMessage, GameStateMessage, MessageEnvelope, send_msg_by_id, send_msg_from_id}, log};
use warp::ws::{Message};

pub async fn handle_message(id: &str, envelope: MessageEnvelope, clients: Clients) {
    log(format!("Received message from {}: {:?}", id, envelope));

    if envelope.chat.is_some() {
        handle_chat_message(id, envelope.chat.unwrap(), clients.clone()).await
    }

    if envelope.canvas.is_some() {
        handle_canvas_message(id, envelope.canvas.unwrap(), clients.clone()).await
    }

    if envelope.game_state.is_some() {
        handle_game_state_message(id, envelope.game_state.unwrap(), clients.clone()).await
    }


    // let response: String;
    // if msg.message == "ping" || msg.message == "ping\n" {
    //     log("received ping".to_string());
    //     // match send_msg_by_id(Message::text("pong!"), id.to_string(), clients).await {
    //     //     Ok(r) => (),
    //     //     Err(e) => logerr(format!("Error in sending message {:?}", e)),
    //     // }
    //     response = "pong!".to_string();
    // }
    // else {
    //     response = msg.message.to_string();
    // }

    // send_msg_by_id(Message::text(response), id.to_string(), &clients).await;

}

// handle chat event
pub async fn handle_chat_message(id: &str, chat_message: ChatMessage, clients: Clients) {
    log(format!("Parsing CHAT message from {}: {:?}", id, chat_message));
    let response = MessageEnvelope {
        chat: Some(chat_message),
        canvas: None,
        game_state: None
    };

    // TODO if user is not the drawer and hasn't guessed correctly
    send_msg_from_id(
        Message::text(serde_json::to_string(&response).expect("Failed to encode to json")), 
        id.to_string(), 
        &clients
    ).await.expect("Failed to send message");
}

// handle canvas event
pub async fn handle_canvas_message(id: &str, canvas_message: CanvasMessage, clients: Clients) {
    log(format!("Parsing CANVAS message from {}: {:?}", id, canvas_message));

    let response = MessageEnvelope {
        chat: None,
        canvas: Some(canvas_message),
        game_state: None
    };

    // send to all other users
    send_msg_from_id(
        Message::text(serde_json::to_string(&response).expect("Failed to encode to json")), 
        id.to_string(), 
        &clients
    ).await.expect("Failed to send message");
}

// handle game state event
pub async fn handle_game_state_message(id: &str, game_state_message: GameStateMessage, clients: Clients) {
    log(format!("Parsing GAME STATE message from {}: {:?}", id, game_state_message));

    let response = MessageEnvelope {
        chat: None,
        canvas: None,
        game_state: Some(game_state_message)
    };

    send_msg_by_id(Message::text(serde_json::to_string(&response).expect("Failed to encode to json")),
        id.to_string(), 
        &clients
    ).await.expect("Failed to send message");

    // send to all other users
    // send_msg_from_id(
    //     Message::text(serde_json::to_string(&response).expect("Failed to encode to json")), 
    //     id.to_string(), 
    //     &clients
    // );

}