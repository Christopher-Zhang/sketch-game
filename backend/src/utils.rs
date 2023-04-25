use std::time::{SystemTime};
use chrono::{prelude::DateTime, Utc};

pub fn current_time() -> String {
    let timestamp = SystemTime::now();
    let datetime = DateTime::<Utc>::from(timestamp);
    let timestamp_str = datetime.format("%Y-%m-%d %H:%M:%S.%f").to_string();
    return timestamp_str;
}