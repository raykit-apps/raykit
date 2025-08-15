// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]
fn main() {
    raykit::main();
}
