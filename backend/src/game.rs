use crate::{Clients, Client, Result, websocket::{current_time, ChatMessage, send_msg_by_id}, logerr, log};
use chrono::prelude::DateTime;
use futures::{FutureExt, StreamExt};
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket, Message};


// pub async fn handle_message(id: &str, msg: &str) {
//     println!("{}:: Received messsage from {}: {:?}", current_time(), id, msg);
// }

pub async fn handle_message(id: &str, msg: ChatMessage, clients: Clients) {
    log(format!("{}:: Received messsage from {}: {:?}", current_time(), id, msg));
    let response: String;
    if msg.message == "ping" || msg.message == "ping\n" {
        log("received ping".to_string());
        // match send_msg_by_id(Message::text("pong!"), id.to_string(), clients).await {
        //     Ok(r) => (),
        //     Err(e) => logerr(format!("Error in sending message {:?}", e)),
        // }
        response = "pong!".to_string();
    }
    else {
        response = msg.message.to_string();
    }

    send_msg_by_id(Message::text(response), id.to_string(), &clients).await;

}