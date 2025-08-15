// use tauri::{path::BaseDirectory, Manager};
// use tauri_plugin_shell::{process::CommandEvent, ShellExt};

use std::{collections::HashMap, io, path::Path};

use rfd::{MessageDialog, MessageLevel};
use tauri::generate_context;
use tauri_plugin_log::{Target, TargetKind};

pub mod core;
pub mod system;

fn files_not_created_on_launch(errors: HashMap<io::ErrorKind, Vec<&Path>>) {
    let message = "Raykit failed to launch";

    let error_details = errors
        .into_iter()
        .flat_map(|(kind, paths)| {
            #[allow(unused_mut)] // for non-unix platforms
            let mut error_kind_details = match paths.len() {
                0 => return None,
                1 => format!(
                    "{kind} when creating directory {:?}",
                    paths.first().expect("match arm checks for a single entry")
                ),
                _many => format!("{kind} when creating directories {paths:?}"),
            };

            #[cfg(unix)]
            {
                match kind {
                    io::ErrorKind::PermissionDenied => {
                        error_kind_details.push_str("\n\nConsider using chown and chmod tools for altering the directories permissions if your user has corresponding rights.\
                            \nFor example, `sudo chown $(whoami):staff ~/.config` and `chmod +uwrx ~/.config`");
                    }
                    _ => {}
                }
            }

            Some(error_kind_details)
        })
        .collect::<Vec<_>>().join("\n\n");

    eprintln!("{message}: {error_details}");

    MessageDialog::new()
        .set_level(MessageLevel::Error)
        .set_title(message)
        .set_description(error_details)
        .show();
}

pub fn main() {
    let tauri_context = generate_context!();

    let file_errors = init_paths();
    if !file_errors.is_empty() {
        files_not_created_on_launch(file_errors);
        return;
    }

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            tauri::async_runtime::set(tokio::runtime::Handle::current());

            let log = tauri_plugin_log::Builder::default()
                .target(Target::new(TargetKind::LogDir {
                    file_name: Some("Raykit".to_string()),
                }))
                .level(log::LevelFilter::Error);

            let builder = tauri::Builder::default()
                .setup(move |app| {
                    #[cfg(target_os = "macos")]
                    app.set_dock_visibility(false);

                    core::window::create(app.handle())?;

                    system::tray::create_tray(app.handle())?;

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

fn init_paths() -> HashMap<io::ErrorKind, Vec<&'static Path>> {
    [
        paths::config_dir(),
        paths::extensions_dir(),
        paths::logs_dir(),
        paths::temp_dir(),
    ]
    .into_iter()
    .fold(HashMap::default(), |mut errors, path| {
        if let Err(e) = std::fs::create_dir_all(path) {
            errors.entry(e.kind()).or_insert_with(Vec::new).push(path);
        }
        errors
    })
}
