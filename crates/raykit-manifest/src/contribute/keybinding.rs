use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Shortcut key binding
/// # Example
/// ```json
/// {
///   "command": "open.settings",
///   "key": "ctrl+p",
///   // macOS-specific keyboard shortcuts
///   "mac": "cmd+p",
/// }
/// ```
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Keybinding {
    /// The command registered by commands
    pub command: String,
    /// The shortcut key, If there is a conflict with the previous shortcut key, the latter one separated by a space will be used as a replacement.
    /// ## Example
    /// "ctrl+p"
    /// "ctrl+p shift+p"
    pub key: String,
    /// macOS-specific keyboard shortcuts
    pub mac: Option<String>,
    /// Windows-specific keyboard shortcuts
    pub windows: Option<String>,
    /// Linux-specific keyboard shortcuts
    pub linux: Option<String>,
    /// Global keyboard shortcuts.
    /// If true, the keyboard shortcut will be triggered globally.
    /// If false, the keyboard shortcut will be triggered only in the current window.
    /// If not specified, the keyboard shortcut will be triggered in the current window.
    pub global: Option<bool>,
    /// The condition for the keyboard shortcut to be triggered
    pub when: Option<String>,
}
