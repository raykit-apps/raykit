#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]

#[tokio::main]
async fn main() {
    let tauri_context = tauri::generate_context!();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let builder = tauri::Builder::default()
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_dock_visibility(false);

            raykit::tray::create_tray(app.handle())?;

            raykit::window::create(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![]);

    builder
        .build(tauri_context)
        .expect("Failed to build tauri app")
        .run(|app_handle, event| {
            let _ = (app_handle, event);
        });
}
