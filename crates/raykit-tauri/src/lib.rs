use tauri::{path::BaseDirectory, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

mod core;
mod system;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            system::tray::create_tray(app.handle())?;

            let resource_path = app.path().resolve("exts-server.js", BaseDirectory::Resource)?;
            println!("{:?}", resource_path.as_path());
            let sidecar_command = app.shell().sidecar("node")?.arg(resource_path.as_path());
            let (mut rx, child) = sidecar_command.spawn()?;

            println!("nodejs 进程ID{}", child.pid());

            tauri::async_runtime::spawn(async move {
                // read events such as stdout
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line_bytes) = event {
                        let line = String::from_utf8_lossy(&line_bytes);
                        println!("{:?}", line);
                    }
                }
            });

            #[cfg(target_os = "macos")]
            app.set_dock_visibility(false);

            core::window::create(app.handle())?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
