#[tauri::command]
pub async fn search_commands(search: String) {
    println!("search: {search}");
}

#[tauri::command]
pub async fn execute_command() {}
