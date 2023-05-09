use crate::{
    log,
    websocket::{
        send_msg_by_game_id, send_msg_by_id, send_msg_from_id, CanvasMessage, ChatMessage,
        GameStateMessage, MessageEnvelope, send_msg_by_user_ids,
    },
    Clients, GameState, Games, Player, PlayerState,
};
use distance::levenshtein;
use warp::ws::Message;

enum GuessResult {
    Correct,
    Close,
    Incorrect,
}

pub async fn update_game_state(game_id: usize, clients: Clients, games: Games) {
    // TODO implement
    // check if round should end
        // time is up
        // everyone has guessed
        // game is empty (DELETE?)
}

pub async fn handle_message(id: &str, envelope: MessageEnvelope, clients: Clients, games: Games) {
    log(format!("Received message from {}:", id));

    if envelope.chat.is_some() {
        handle_chat_message(id, envelope.chat.unwrap(), clients.clone(), games.clone()).await
    }

    if envelope.canvas.is_some() {
        handle_canvas_message(id, envelope.canvas.unwrap(), clients.clone(), games.clone()).await
    }

    if envelope.game_state.is_some() {
        handle_game_state_message(id, envelope.game_state.unwrap(), clients.clone(), games.clone()).await
    }
}

// handle chat event
pub async fn handle_chat_message(id: &str, chat_message: ChatMessage, clients: Clients, games: Games) {
    log(format!(
        "Parsing CHAT message from {}: {:?}",
        &id, &chat_message
    ));
    let game_id = chat_message.game_id.clone();
    let user_id = chat_message.user_id.clone();
    let message = chat_message.message.clone();
    let game = get_game_by_id(&game_id, games.clone()).await.expect("Failed to find game");
    let (guessed, guessing, drawer) = get_players_by_state(game.clone());

    let mut player_state = game.player_states.get(&user_id).unwrap_or(&PlayerState::Spectator);
    let active_round = in_active_round(&game);

    if active_round && matches!(player_state, PlayerState::Guessing) {

        // check guess
        let outcome = check_guess(message, game.current_word);
        // send message if close
        if matches!(outcome, GuessResult::Close) {
            // TODO implement
        }
        // change state if correct
        if matches!(outcome, GuessResult::Correct) {
            // TODO implement
            //  update score
        }

        //  etc

    }

    let response = MessageEnvelope {
        chat: Some(chat_message.clone()),
        canvas: None,
        game_state: None,
    };
    let msg = Message::text(serde_json::to_string(&response).expect("Failed to encode to json"));
    // TODO if user is not the drawer and hasn't guessed correctly
    if !active_round || matches!(player_state, PlayerState::Guessing) {
        send_msg_by_game_id(
            msg,
            game_id.clone(),
            &clients,
        )
        .await
        .expect("Failed to send message");
    }
    else {
        let user_ids: Vec<usize> = guessed.iter().map(|p| p.user_id).collect();
        send_msg_by_user_ids(msg, &user_ids, &clients).await.expect("Failed to send message");
    }



}

// handle canvas event
pub async fn handle_canvas_message(id: &str, canvas_message: CanvasMessage, clients: Clients, games: Games) {
    log(format!("Parsing CANVAS message from {}", id));

    let response = MessageEnvelope {
        chat: None,
        canvas: Some(canvas_message),
        game_state: None,
    };

    // send to all other users
    send_msg_from_id(
        Message::text(serde_json::to_string(&response).expect("Failed to encode to json")),
        id.to_string(),
        &clients,
    )
    .await
    .expect("Failed to send message");
}

// handle game state event
pub async fn handle_game_state_message(
    id: &str,
    game_state_message: GameStateMessage,
    clients: Clients,
    games: Games
) {
    log(format!(
        "Parsing GAME STATE message from {}: {:?}",
        id, game_state_message
    ));

    let response = MessageEnvelope {
        chat: None,
        canvas: None,
        game_state: Some(game_state_message),
    };

    send_msg_by_id(
        Message::text(serde_json::to_string(&response).expect("Failed to encode to json")),
        id.to_string(),
        &clients,
    )
    .await
    .expect("Failed to send message");

    // send to all other users
    // send_msg_from_id(
    //     Message::text(serde_json::to_string(&response).expect("Failed to encode to json")),
    //     id.to_string(),
    //     &clients
    // );
}

// UTILS

fn check_guess(guess: String, answer: String) -> GuessResult {
    if guess.eq(&answer) {
        return GuessResult::Correct;
    }
    let dist = levenshtein(&guess, &answer);

    if dist < 3 {
        return GuessResult::Close;
    } else {
        return GuessResult::Incorrect;
    }
}

// guessed, guessing, drawing
pub fn get_players_by_state(game: GameState) -> (Vec<Player>, Vec<Player>, Option<Player>) {
    let mut guessed: Vec<Player> = Vec::new();
    let mut guessing: Vec<Player> = Vec::new();
    let mut drawer: Option<Player> = None;

    game.player_states.iter().for_each(|(user_id, state)| {
        if matches!(state, PlayerState::Drawing) {
            drawer = game
                .player_list
                .iter()
                .find(|p| p.user_id == user_id.clone())
                .cloned();
        }
        if matches!(state, PlayerState::Guessed) {
            let found = game
                .player_list
                .iter()
                .find(|p| p.user_id == user_id.clone())
                .cloned();
            match found {
                Some(p) => guessed.push(p.clone()),
                None => (),
            }
        }
        if matches!(state, PlayerState::Guessing) {
            let found = game
                .player_list
                .iter()
                .find(|p| p.user_id == user_id.clone())
                .cloned();
            match found {
                Some(p) => guessing.push(p.clone()),
                None => (),
            }
        }
    });
    (guessed, guessing, drawer)
}

pub async fn get_game_by_id(game_id: &usize, games: Games) -> Option<GameState> {
    match games.read().await.get(game_id) {
        Some(g) => Some(g.clone()),
        None => None,
    }
}

pub fn in_active_round(game: &GameState) -> bool {
    return game.current_word.ne("") && game.round_end > game.round_start && game.round_end != 0;
}
