use dirs::home_dir;
use rayon::prelude::*;
use std::env;
use std::path::Path;

pub fn directory() -> String {
  let current_dir = match std::env::current_dir() {
    Ok(x) => Some(x),
    Err(e) => {
      println!("Unable to determine current cirectory: {}", e);
      return String::from("");
    }
  };

  let current_dir = Path::new(current_dir.as_ref().unwrap());
  let home_dir = home_dir().unwrap();
  let home_dir = home_dir.as_path();

  let current_dir = if !current_dir.starts_with(home_dir) {
    String::from(current_dir.to_str().unwrap())
  } else if current_dir == home_dir {
    String::from("~")
  } else {
    format!("~/{}", current_dir.strip_prefix(home_dir).unwrap().to_str().unwrap())
  };

  let mut parts = current_dir.split('/').collect::<Vec<&str>>();

  if parts[0] == "" {
    parts.remove(0);
  }

  if parts.len() <= 3 {
    return current_dir;
  }

  let parts = &parts[parts.len() - 3..];
  parts.join("/")
}
