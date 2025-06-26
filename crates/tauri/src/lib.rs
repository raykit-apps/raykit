// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // let effects = EffectsBuilder::new()
            //     .effects(vec![Effect::HudWindow,Effect::Acrylic, Effect::Blur])
            //     .radius(12.0)
            //     .build();

            // WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
            //     .title("Raykit")
            //     .inner_size(800.0, 600.0)
            //     .decorations(false)
            //     .transparent(true)
            //     .effects(effects)
            //     .theme(Some(Theme::Dark))
            //     .build()
            //     .unwrap();

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
