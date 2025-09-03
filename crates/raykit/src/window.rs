#[cfg(not(target_os = "macos"))]
pub fn create(handle: &tauri::AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    let effects = tauri::window::EffectsBuilder::new()
        .effects(vec![tauri::window::Effect::Mica])
        .build();

    let window = tauri::WebviewWindowBuilder::new(handle, "main", tauri::WebviewUrl::default())
        .resizable(true)
        .title("Raykit")
        .min_inner_size(400.0, 400.0)
        .inner_size(750.0, 475.0)
        .center()
        .transparent(true)
        .visible(false)
        .decorations(false)
        .skip_taskbar(true)
        .effects(effects)
        .build()?;

    Ok(window)
}

#[cfg(target_os = "macos")]
pub fn create(handle: &tauri::AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    let effects = tauri::window::EffectsBuilder::new()
        .effects(vec![tauri::window::Effect::WindowBackground])
        .radius(12.0)
        .build();

    let window = tauri::WebviewWindowBuilder::new(handle, "main", tauri::WebviewUrl::default())
        .resizable(true)
        .title("Raykit")
        .min_inner_size(400.0, 450.0)
        .inner_size(750.0, 550.0)
        .center()
        .visible(false)
        .transparent(true)
        .decorations(false)
        .effects(effects)
        .build()?;

    Ok(window)
}
