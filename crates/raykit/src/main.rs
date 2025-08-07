// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::generate_context;

use raykit::core;
use tauri_plugin_log::{Target, TargetKind};

fn main() {
    let tauri_context = generate_context!();

    let config_dir = dirs::home_dir().expect("missing home dir").join(".raykit");
    fs::create_dir(&config_dir).expect("failed to create config dir");

    let extensions_dir = config_dir.join("extensions");
    fs::create_dir(&extensions_dir).expect("failed to create extensions dir");

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            tauri::async_runtime::set(tokio::runtime::Handle::current());

            // Configure the log output directory and level
            let log = tauri_plugin_log::Builder::default()
                .target(Target::new(TargetKind::LogDir {
                    file_name: Some("ui-logs".to_string()),
                }))
                .level(log::LevelFilter::Error);

            let builder = tauri::Builder::default()
                .setup(move |tauri_app| {
                    raykit::core::window::create(tauri_app.handle())?;

                    raykit::system::tray::create_tray(tauri_app.handle())?;

                    Ok(())
                })
                .plugin(tauri_plugin_opener::init())
                .plugin(tauri_plugin_shell::init())
                .plugin(log.build())
                .invoke_handler(tauri::generate_handler![
                    core::commands::search_commands,
                    core::commands::execute_command
                ]);

            builder
                .build(tauri_context)
                .expect("Failed to build tauri app")
                .run(|app_handle, event| {
                    let _ = (app_handle, event);
                });
        });
}
