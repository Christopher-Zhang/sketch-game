use crate::{Clients, Client, Result, websocket::current_time};
use chrono::prelude::DateTime;
use futures::{FutureExt, StreamExt};
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket, Message};


pub async fn handle_message(id: &str, msg: &str) {
    println!("{}:: Received messsage from {}: {:?}", current_time(), id, msg);
}