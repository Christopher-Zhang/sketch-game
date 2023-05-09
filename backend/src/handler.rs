use std::collections::HashMap;

use crate::{
    log, logerr, websocket, Client, Clients, GameState, Games, Player, PlayerState, Result,
};
use rand::Rng;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use warp::{http::StatusCode, reply::json, ws::Message, Reply};

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    username: String,
    game_id: usize,
}
#[derive(Serialize, Debug)]
pub struct RegisterResponse {
    url: String,
    user_id: usize,
}
#[derive(Deserialize, Debug)]
pub struct Event {
    game_id: Option<usize>,
    message: String,
}

pub async fn publish_handler(event: Event, clients: Clients) -> Result<impl Reply> {
    clients
        .read()
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

pub async fn register_handler(
    body: RegisterRequest,
    clients: Clients,
    games: Games,
) -> Result<impl Reply> {
    let user_id = get_unique_user_id(clients.clone()).await;
    let game_id: usize = body.game_id;
    let username: String = body.username;
    let uuid = Uuid::new_v4().as_simple().to_string();
    log(format!("Registering {}", user_id));

    register_client(uuid.clone(), username, user_id, game_id, clients, games).await;
    Ok(json(&RegisterResponse {
        url: format!("ws://127.0.0.1:8000/ws/{}", uuid),
        user_id,
    }))
}

async fn register_client(
    id: String,
    username: String,
    user_id: usize,
    game_id: usize,
    clients: Clients,
    games: Games,
) {
    // create/join game
    let game = get_game_if_active(game_id, &games).await;
    match game {
        Some(_) => (),
        None => create_new_game(game_id, &games).await,
    }

    // add new player/client
    clients.write().await.insert(
        id,
        Client {
            username,
            user_id,
            game_id,
            sender: None,
        },
    );

    // update game
    add_user_to_game(game_id, user_id, &clients, games).await;
}

pub async fn unregister_handler(id: String, clients: Clients, games: Games) -> Result<impl Reply> {
    let mut user_id = 0;
    let mut game_id = 0;
    match clients.read().await.get(&id) {
        Some(x) => {
            user_id = x.user_id;
            game_id = x.game_id;
            log(format!("Unregistering User: {}", x.user_id));
        }
        None => {
            logerr(format!("Failed to unregister {}", id));
        }
    }
    clients.write().await.remove(&id);
    remove_user_from_game(game_id, user_id, games).await;
    log(format!("Unregistered {}", id));
    Ok(StatusCode::OK)
}

pub async fn websocket_handler(
    websocket: warp::ws::Ws,
    id: String,
    clients: Clients,
    games: Games,
) -> Result<impl Reply> {
    let client = clients.read().await.get(&id).cloned();
    match client {
        Some(c) => Ok(websocket
            .on_upgrade(move |socket| websocket::client_connection(socket, id, clients, c, games))),
        None => Err(warp::reject::not_found()),
    }
}

pub async fn health_handler() -> Result<impl Reply> {
    Ok(StatusCode::OK)
}

// helper functions

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

async fn get_game_if_active(game_id: usize, games: &Games) -> Option<GameState> {
    match games.read().await.get(&game_id) {
        Some(game) => Some(game.clone()),
        None => None,
    }
}

async fn create_new_game(game_id: usize, games: &Games) {
    games.write().await.insert(
        game_id,
        GameState {
            game_id: game_id,
            player_states: HashMap::new(),
            scores: HashMap::new(),
            round_start: 0,
            round_end: 0,
            player_list: Vec::new(),
            current_word: String::from(""),
        },
    );
}

async fn remove_user_from_game(game_id: usize, user_id: usize, games: Games) {
    match games.write().await.get_mut(&game_id) {
        Some(game_state) => {
            let index = game_state
                .player_list
                .iter()
                .position(|x| x.user_id == user_id)
                .unwrap();
            game_state.player_list.remove(index);
            game_state.scores.remove(&user_id);
            game_state.player_states.remove(&user_id);
        }
        None => (),
    }
}

async fn add_user_to_game(game_id: usize, user_id: usize, clients: &Clients, games: Games) {
    let player = Player {
        user_id: user_id.clone(),
        username: get_username_from_user_id(user_id, &clients)
            .await
            .expect("Failed to find user"),
    };
    match games.write().await.get_mut(&game_id) {
        Some(game_state) => {
            game_state.player_list.push(player);
            game_state.scores.insert(user_id, 0);
            game_state
                .player_states
                .insert(user_id, PlayerState::Guessing);
        }
        None => (),
    }
}

async fn get_username_from_user_id(user_id: usize, clients: &Clients) -> Option<String> {
    match clients
        .read()
        .await
        .iter()
        .find(|(_, client)| client.user_id == user_id)
    {
        Some(client) => Some(client.1.username.clone()),
        None => None,
    }
}
