use std::time::{SystemTime, UNIX_EPOCH};
use chrono::{prelude::DateTime, Utc};

pub fn current_time() -> String {
    let timestamp = SystemTime::now();
    let datetime = DateTime::<Utc>::from(timestamp);
    let timestamp_str = datetime.format("%Y-%m-%d %H:%M:%S.%f").to_string();
    return timestamp_str;
}

pub fn current_unix_timestamp() -> usize {
    let time = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => 0,
    };

    return time as usize;
}