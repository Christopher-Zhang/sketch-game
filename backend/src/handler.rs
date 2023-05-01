use crate::{Clients, Client, Result, websocket, log, logerr};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use warp::{Reply, reply::json, ws::Message, http::StatusCode};
use rand::Rng;

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    username: String,
    user_id: usize,
    game_id: usize,
}
#[derive(Serialize, Debug)]
pub struct RegisterResponse {
    url: String,
}
#[derive(Deserialize, Debug)]
pub struct Event {
    game_id: Option<usize>,
    message: String,
}

pub async fn publish_handler(event: Event, clients: Clients) -> Result<impl Reply> {
    clients.read()
        .await
        .iter()
        .filter(|(_, client)| match event.game_id {
            Some(v) => client.game_id == v,
            None => true,
        })
        .for_each(|(_, client)| {
            if let Some(sender) = &client.sender {
                let _ = sender.send(Ok(Message::text(event.message.clone())));
            }
        });

    Ok(StatusCode::OK)
}

pub async fn register_handler(body: RegisterRequest, clients: Clients) -> Result<impl Reply> {
    let user_id = get_unique_user_id(clients.clone()).await;
    let game_id: usize = body.game_id;
    let username: String = body.username;
    let uuid = Uuid::new_v4().as_simple().to_string();
    log(format!("Registering {}", user_id));

    register_client(uuid.clone(), username, user_id, game_id, clients).await;
    Ok(json(&RegisterResponse {
        url: format!("ws://127.0.0.1:8000/ws/{}", uuid),
    }))
}

async fn get_unique_user_id(clients: Clients) -> usize {
    let mut user_id: usize = rand::thread_rng().gen::<usize>();
    while !is_unique_user_id(user_id, &clients).await {
        user_id = rand::thread_rng().gen::<usize>();
    }
    return user_id;
}

async fn is_unique_user_id(user_id: usize, clients: &Clients) -> bool {
    return !clients.read().await.iter().any(|(_, client)| {
        return client.user_id == user_id;
    });
}

async fn register_client(id: String, username: String, user_id: usize, game_id: usize, clients: Clients) {
    // create/join game

    // add new player/client
    clients.write().await.insert(
        id,
        Client{
            username,
            user_id,
            game_id,
            sender: None,
        },
    );
}

pub async fn unregister_handler(id: String, clients: Clients) -> Result<impl Reply> {
    match clients.read().await.get(&id) {
        Some(x) => {
            log(format!("Unregistering User: {}", x.user_id));
        },
        None => {
            logerr(format!("Failed to unregister {}", id));
        }
    }
    clients.write().await.remove(&id);
    log(format!("Unregistered {}", id));
    Ok(StatusCode::OK)
}

pub async fn websocket_handler(websocket: warp::ws::Ws, id: String, clients: Clients) -> Result<impl Reply> {
    let client = clients.read().await.get(&id).cloned();
    match client {
        Some(c) => Ok(websocket.on_upgrade(move |socket| websocket::client_connection(socket, id, clients, c))),
        None => Err(warp::reject::not_found()),
    }
}

pub async fn health_handler() -> Result<impl Reply> {
    Ok(StatusCode::OK)
}


