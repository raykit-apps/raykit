#[cfg(not(target_os = "macos"))]
pub fn init(handle: &tauri::AppHandle) -> tauri::Result<tauri::Window> {
    let effects = tauri::window::EffectsBuilder::new()
        .effects(vec![tauri::window::Effect::Mica])
        .build();

    let window = tauri::WindowBuilder::new(handle, "main")
        .resizable(true)
        .title("Raykit")
        .min_inner_size(400., 400.)
        .inner_size(750., 475.)
        .max_inner_size(900., 1200.)
        .center()
        .transparent(true)
        .visible(false)
        .decorations(false)
        .skip_taskbar(true)
        .effects(effects)
        .build()?;

    window.add_child(
        tauri::WebviewBuilder::new("main-extension", tauri::WebviewUrl::App("/extension".into())),
        tauri::LogicalPosition::new(0., 0.),
        tauri::LogicalSize::new(750., 435.),
    )?;

    window.add_child(
        tauri::WebviewBuilder::new("main-app", tauri::WebviewUrl::App(Default::default())).auto_resize(),
        tauri::LogicalPosition::new(0., 0.),
        tauri::LogicalSize::new(750., 475.),
    )?;

    Ok(window)
}

#[cfg(target_os = "macos")]
pub fn init(handle: &tauri::AppHandle) -> tauri::Result<tauri::Window> {
    let effects = tauri::window::EffectsBuilder::new()
        .effects(vec![tauri::window::Effect::WindowBackground])
        .radius(12.0)
        .build();

    let window = tauri::WindowBuilder::new(handle, "main")
        .resizable(true)
        .title("Raykit")
        .min_inner_size(400., 400.)
        .inner_size(750., 475.)
        .max_inner_size(900., 1200.)
        .center()
        .visible(false)
        .transparent(true)
        .decorations(false)
        .effects(effects)
        .build()?;

    window.add_child(
        tauri::WebviewBuilder::new("main-app", tauri::WebviewUrl::App(Default::default())).auto_resize(),
        tauri::LogicalPosition::new(0., 0.),
        tauri::LogicalSize::new(750., 476.),
    )?;

    Ok(window)
}

pub fn set_webview_always_on_top(window: &tauri::Window, webview_label: &str) -> anyhow::Result<()> {
    use tauri::Manager;
    if let Some(webview) = window.get_webview(webview_label) {
        webview.reparent(&window)?;
    }
    Ok(())
}
