use dirs::home_dir;
use rayon::prelude::*;
use std::env;
use std::path::Path;

mod sections;

fn main() {
  let args: Vec<String> = env::args().collect();

  if args.len() != 2 {
    return;
  }

  match args[1].as_str() {
    "prompt" => {
      println!("{}", sections::directory());
    }
    _ => return,
  }
}
