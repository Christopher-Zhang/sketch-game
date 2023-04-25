use crate::{Clients, Client, Result, game::handle_message, logerr, log};

use futures::{FutureExt, StreamExt};
use serde::{Serialize, Deserialize};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket, Message};
use warp::{http::StatusCode, Reply};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub user_id: usize,
    pub username: String,
    pub game_id: usize,
    pub message: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvasMessage {
    pub user_id: usize,
    pub game_id: usize,
    pub color: Color
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
    pub debug: String
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

    client.sender = Some(client_sender);
    clients.write().await.insert(id.clone(), client);

    log(format!("connected to {}", id));

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("Error for id: {}, {}", id.clone(), e);
                break;
            }
        };
        client_msg(&id, msg, &clients).await.expect("Failed to send message");
    }

    clients.write().await.remove(&id);
    log(format!("disconnected {}", id));
}

async fn client_msg(id: &str, msg: Message, clients: &Clients) -> Result<impl Reply> {
    log(format!("Received message from {}: {:?}", id, msg));
    let raw = match msg.to_str() {
        Ok(v) => v,
        Err(_) => "",
    };
    let obj: MessageEnvelope = serde_json::from_str(raw).unwrap();
    // log(format!("Parsed: {:?}", obj));
    // log(format!("message: {}", raw));

    // TODO make a chat message struct and use that as the message instead of the ws message
    // if raw == "ping" || raw == "ping\n" {
    //     log("received ping".to_string());
    //     match send_msg_by_id(Message::text("pong!"), id.to_string(), clients).await {
    //         Ok(r) => (),
    //         Err(e) => logerr(format!("Error in sending message {:?}", e)),
    //     }
    //     return;
    // }

    handle_message(id, obj, clients.clone()).await;

    Ok(StatusCode::OK)

}

// // send message to all players in a specific game
// pub async fn send_msg_by_game_id(msg: Message, game_id: usize, clients: Clients) -> Result<impl Reply> {
//     clients.read()
//         .await
//         .iter()
//         .filter(|(_, client)| 
//             client.game_id == game_id
//         )
//         .for_each(|(_, client)| {
//             send_msg_to_client(msg.clone(), client);
//         });

//     Ok(StatusCode::OK)
// }

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
    if let Some(sender) = &client.sender {
        let _ = sender.send(Ok(msg));
    }
    else {
        logerr(format!("Failure to send message {:?}", msg.to_str()));
    }
}

pub async fn send_msg_from_id(msg: Message, id: String, clients: &Clients) -> Result<impl Reply> {
    clients.read()
        .await
        .iter()
        .filter(|(uuid, _)| uuid.as_str() == id.as_str())
        .for_each(|(_, client)|{
            send_msg_to_client(msg.clone(), client);
        });

    Ok(StatusCode::OK)
}


