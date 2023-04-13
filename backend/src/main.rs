use crate::{websocket::current_time};
use tokio::sync::{mpsc, RwLock};
use warp::hyper::Method;
use warp::{ws::Message, Rejection, Filter};
use std::sync::Arc;
use std::collections::HashMap;
use std::convert::Infallible;

mod handler;
mod websocket;
mod game;
#[derive(Debug, Clone)]
pub struct Client {
    pub username: String,
    pub user_id: usize,
    pub game_id: usize,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
}
type Result<T> = std::result::Result<T, Rejection>;
type Clients = Arc<RwLock<HashMap<String, Client>>>;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let health_route = warp::path!("health").and_then(handler::health_handler);

    let register = warp::path("register");
    let register_routes = register
        .and(warp::post())
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handler::register_handler)
        .or(register
            .and(warp::delete())
            .and(warp::path::param())
            .and(with_clients(clients.clone()))
            .and_then(handler::unregister_handler)
        );

    let websocket_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_clients(clients.clone()))
        .and_then(handler::websocket_handler);

    let publish_route = warp::path!("publish")
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handler::publish_handler);

    let cors= warp::cors().allow_any_origin()
        .allow_headers(vec!["Access-Control-Allow-Headers", "Access-Control-Request-Method", "Access-Control-Request-Headers", "Origin", "Accept", "X-Requested-With", "Content-Type"])
        .allow_methods(&[Method::GET, Method::POST, Method::PUT, Method::PATCH, Method::DELETE, Method::OPTIONS, Method::HEAD]);
    let routes = register_routes
        .or(websocket_route)
        .or(publish_route)
        .or(health_route)
        .with(cors);

    // GO!
    warp::serve(routes).run(([127,0,0,1], 8000)).await;
}

fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,), Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}

pub fn log(message: String) {
    let timestamp = current_time();
    println!("LOG: {}: {}", timestamp, message);
}

pub fn logerr(message: String) {
    let timestamp = current_time();
    println!("ERR: {}: {}", timestamp, message);
}