#[tauri::command(async)]
pub fn search_commands() -> String {
    "test".to_string()
}

#[tauri::command(async)]
pub fn execute_command() -> String {
    "test".to_string()
}
