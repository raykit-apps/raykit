#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]

use raykit::{commands, tray, window};

#[tokio::main]
async fn main() {
    let tauri_context = tauri::generate_context!();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let builder = tauri::Builder::default()
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_dock_visibility(false);

            window::init(app.handle())?;

            tray::create(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::search_commands,
            commands::execute_command
        ]);

    builder
        .build(tauri_context)
        .expect("Failed to build tauri app")
        .run(|app_handle, event| {
            let _ = (app_handle, event);
        });
}
