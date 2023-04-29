use crate::utils::current_unix_timestamp;
use crate::{Clients, Client, Result, game::handle_message, logerr, log};

use futures::{FutureExt, StreamExt};
use serde::{Serialize, Deserialize};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket, Message};
use warp::{http::StatusCode, Reply};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub ts: usize,
    pub user_id: usize,
    pub username: String,
    pub game_id: usize,
    pub message: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvasEvent {
    start_x: usize,
    start_y: usize,
    line_x: usize,
    line_y: usize,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CanvasMessage {
    pub ts: usize,
    pub user_id: usize,
    pub game_id: usize,
    pub color: Color,
    pub line_width: usize,
    pub canvas_events: Vec<CanvasEvent>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Color {
    White = 0,
    Black = 1,
    Gray = 2,
    Brown = 3,
    Red = 4,
    Blue = 5,
    Green = 6,
    Yellow = 7,
    Purple = 8,
    Pink = 9,
    Orange = 10,
    Cyan = 11,
    Lime = 12,
    Magenta = 13,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GameStateMessage {
    pub ts: usize,
    pub player_list: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageEnvelope {
    pub chat: Option<ChatMessage>,
    pub canvas: Option<CanvasMessage>,
    pub game_state: Option<GameStateMessage>
}

pub async fn client_connection(websocket: WebSocket, id: String, clients: Clients, mut client: Client) {
    let (client_ws_sender, mut client_ws_rcv) = websocket.split();
    let (client_sender, client_rcv) = mpsc::unbounded_channel();

    let client_rcv = UnboundedReceiverStream::new(client_rcv);
    tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
        if let Err(e) = result {
            logerr(format!("Error sending websocket message: {}", e));
        }
    }));
    let game_id = client.game_id;
    client.sender = Some(client_sender);
    log(format!("client {:?}", client.clone()));
    clients.write().await.insert(id.clone(), client);
    log(format!("connected to {}", id));
    
    // update clients' player list
    let game_state_message: GameStateMessage = GameStateMessage { 
        ts: current_unix_timestamp(), 
        player_list: clients.read().await.iter().filter(|(_, client)| client.game_id == game_id).map(|(_, client)| {client.username.clone()}).collect()
    };
    let message_envelope = MessageEnvelope {
        chat: None,
        canvas: None,
        game_state: Some(game_state_message)
    };
    let msg = Message::text(serde_json::to_string(&message_envelope).expect("Failed to encode to json"));
    send_msg_by_game_id(msg, game_id, &clients).await.expect("Failed to send player list");

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("Error for id: {}, {}", id.clone(), e);
                break;
            }
        };
        client_msg(&id, msg, &clients).await.expect("Failed to exist");
    }

    clients.write().await.remove(&id);
    log(format!("disconnected {}", id));
}

async fn client_msg(id: &str, msg: Message, clients: &Clients) -> Result<impl Reply> {
    log(format!("Received message from {}", id));
    let raw = match msg.to_str() {
        Ok(v) => v,
        Err(_) => "",
    };

    if raw.len() == 0 {
        log("Length = 0".to_string());
        Ok(StatusCode::OK)
    }
    else {
        let obj: MessageEnvelope = serde_json::from_str::<MessageEnvelope>(raw).expect("Failed to parse");
        handle_message(id, obj, clients.clone()).await;

        Ok(StatusCode::OK)
    }


}

// // send message to all players in a specific game
pub async fn send_msg_by_game_id(msg: Message, game_id: usize, clients: &Clients) -> Result<impl Reply> {
    clients.read()
        .await
        .iter()
        .filter(|(_, client)| 
            client.game_id == game_id
        )
        .for_each(|(_, client)| {
            send_msg_to_client(msg.clone(), client);
        });

    Ok(StatusCode::OK)
}

// // send message to specific user id
// pub async fn send_msg_by_user_id(msg: Message, user_id: usize, clients: Clients) -> Result<impl Reply> {
//     clients.read()
//         .await
//         .iter()
//         .filter(|(_, client)| user_id == client.user_id)
//         .for_each(|(_, client)| {
//             send_msg_to_client(msg.clone(), client);
//         });
//     Ok(StatusCode::OK)
// }

// send message to specific UUID
pub async fn send_msg_by_id(msg: Message, id: String, clients: &Clients) -> Result<impl Reply> {
    let client = clients.read().await.get(&id).cloned();
    match client {
        Some(c) => send_msg_to_client(msg, &c),
        None => (),
    }
    // TODO maybe add error handling
    Ok(StatusCode::OK)
}

// send message to specific client
fn send_msg_to_client(msg: Message, client: &Client) {
    log(format!("Sending message to {:?}", client));
    let mut success = false;
    // if let Some(sender) = &client.sender {
    //     let _ = sender.send(Ok(msg));
    // }
    // else {
    //     logerr(format!("Failure to send message {:?}", msg.to_str()));
    // }
    while !success {
        if let Some(sender) = &client.sender {
            let _ = sender.send(Ok(msg.clone()));
            success = true;
        }
    }
}

pub async fn send_msg_from_id(msg: Message, id: String, clients: &Clients) -> Result<impl Reply> {
    clients.read()
        .await
        .iter()
        .filter(|(uuid, _)| uuid.as_str() != id.as_str())
        .for_each(|(_, client)|{
            send_msg_to_client(msg.clone(), client);
        });

    Ok(StatusCode::OK)
}

// async fn show_clients(clients: &Clients) {
//     clients.read()
//         .await
//         .iter()
//         .for_each(|(_,client)|{
//             log(format!("CLIENT OBJECT {:?}", client));
//         });
// }

