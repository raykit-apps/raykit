use tauri::{
    Manager, Runtime,
    menu::{AboutMetadataBuilder, MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let about = AboutMetadataBuilder::new()
        .name(Some("Raykit"))
        .version(Some("0.0.1"))
        .authors(Some(vec!["raykit-apps".to_string()]))
        .license(Some("MIT"))
        .icon(Some(app.default_window_icon().unwrap().clone()))
        .build();

    let menu = MenuBuilder::with_id(app, "tray-main")
        .item(&MenuItem::with_id(app, "help", "帮助文档", true, None::<&str>)?)
        .item(&MenuItem::with_id(app, "issues", "意见反馈", true, None::<&str>)?)
        .separator()
        .item(&MenuItem::with_id(app, "settings", "系统设置", true, None::<&str>)?)
        .about_with_text("关于", Some(about))
        .separator()
        .item(&MenuItem::with_id(app, "reset", "重启", true, None::<&str>)?)
        .quit_with_text("退出")
        .build()?;

    let _ = TrayIconBuilder::with_id("tray-main")
        .tooltip("Raykit")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                // in this example, let's show and focus the main window when the tray is clicked
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => (),
        })
        .on_menu_event(|_, event| match event.id.as_ref() {
            "issues" => {
                println!("issues");
            }
            _ => {
                println!("unknown menu item: {:?}", event.id);
            }
        })
        .build(app)?;

    Ok(())
}
