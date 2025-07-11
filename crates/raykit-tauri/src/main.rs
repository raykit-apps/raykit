// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::generate_context;

use raykit_tauri::core;

fn main() {
    let tauri_context = generate_context!();

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            tauri::async_runtime::set(tokio::runtime::Handle::current());

            let builder = tauri::Builder::default()
                .setup(move |tauri_app| {
                    raykit_tauri::core::window::create(tauri_app.handle())?;

                    raykit_tauri::system::tray::create_tray(tauri_app.handle())?;

                    Ok(())
                })
                .plugin(tauri_plugin_opener::init())
                .plugin(tauri_plugin_shell::init())
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
