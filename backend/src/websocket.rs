use crate::{Clients, Client, Result, game::handle_message, handler::publish_handler};
use chrono::{prelude::DateTime, Utc};
use futures::{FutureExt, StreamExt};
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket, Message};
use crate::{handler};

pub async fn client_connection(websocket: WebSocket, id: String, clients: Clients, mut client: Client) {
    let (client_ws_sender, mut client_ws_rcv) = websocket.split();
    let (client_sender, client_rcv) = mpsc::unbounded_channel();

    let client_rcv = UnboundedReceiverStream::new(client_rcv);
    tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
        if let Err(e) = result {
            eprintln!("Error sending websocket message: {}", e);
        }
    }));

    client.sender = Some(client_sender);
    clients.write().await.insert(id.clone(), client);

    println!("connected to {}", id);

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("Error for id: {}, {}", id.clone(), e);
                break;
            }
        };
        client_msg(&id, msg, &clients).await;
    }

    clients.write().await.remove(&id);
    println!("disconnected {}", id);
}

async fn client_msg(id: &str, msg: Message, clients: &Clients) {
    println!("{}:: Received message from {}: {:?}", current_time(), id, msg);
    let message = match msg.to_str() {
        Ok(v) => v,
        Err(_) => return,
    };

    if message == "ping" || message == "ping\n" {
        return;
    }

    handle_message(id, message).await;

}

async fn send_msg_to_client(id: &str, msg: Message, client: &Client) {
    if let Some(sender) = &client.sender {
        
    }
}

pub fn current_time() -> String {
    let timestamp = SystemTime::now();//.duration_since(UNIX_EPOCH).expect("Uhoh");
    let datetime = DateTime::<Utc>::from(timestamp);
    let timestamp_str = datetime.format("%Y-%m-%d %H:%M:%S.%f").to_string();
    return timestamp_str;
}