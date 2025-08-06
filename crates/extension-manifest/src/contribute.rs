use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Represents a command definition for registration.
/// ## Example
/// {
///   "command": "open.url",
///   "title": "打开链接",
///   "description": "通过默认浏览器打开链接",
/// }
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Command {
    /// Unique identifier for the command.
    #[schemars(
        title = "Command ID",
        length(min = 2, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub command: String,
    /// Display name of the command.
    /// Shown in user preferences and Raykit's root search interface.
    #[schemars(title = "The human-friendly command's name", length(min = 2, max = 255))]
    pub title: String,
    /// Supplemental text for the command.
    /// Displayed in root search results (optional).
    #[schemars(title = "Additional command descriptor", length(min = 2, max = 255))]
    pub subtitle: Option<String>,
    /// It helps users understand what the command does. This information will be displayed in the preferences.
    #[schemars(title = "The command's description", length(min = 12, max = 2048))]
    pub description: String,
    /// It is recommended to use SVG for icons.
    /// If PNG or JPG is needed, the minimum size should be 512x512 pixels.
    /// The icon will be displayed in "Preferences" and "Raykit Root Directory Search".
    /// If there is no icon for this command, it will inherit the icon of the extension.
    /// Please note that icons support dark and light themes. For example, set this property to "icon.png" and place two files "icon@light.png" and "icon@dark.png" in the resource folder.
    #[schemars(title = "The command's icon", pattern(r"\.(png|svg|jpg)$"))]
    pub icon: Option<String>,
    /// Whether the command is disabled by default.
    /// /// Defaults to `false`.
    #[schemars(title = "Whether the command is disabled by default")]
    pub disabled_by_default: Option<bool>,
}

/// command search palette
/// ## Example
/// {
///   "contributes": {
///     "palettes": [
///       {
///         "command": "myExtension.sayHello",
///       }
///     ]
///   }
/// }
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Palette {
    /// Unique identifier of the command triggered by this palette
    #[schemars(
        title = "The command's identifier",
        length(min = 2, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub command: String,
    /// Match the character limit
    #[schemars(title = "Match the character limit")]
    pub when: String,
    #[schemars(title = "The human-friendly command's name")]
    pub lens: Option<[u32; 2]>,
    /// Display name of the command.
    /// Shown in Raykit's root search interface.
    /// If no title is specified, it will inherit the title name of the command.
    #[schemars(title = "The human-friendly command's name", length(min = 2, max = 255))]
    pub title: Option<String>,
    /// Supplemental text for the command.
    /// Displayed in root search results (optional).
    /// If no subtitle is specified, it will inherit the subtitle name of the command.
    #[schemars(title = "Additional command descriptor", length(min = 2, max = 255))]
    pub subtitle: Option<String>,
    /// It is recommended to use SVG for icons.
    /// If PNG or JPG is needed, the minimum size should be 512x512 pixels.
    /// The icon will be displayed in "Raykit Root Directory Search".
    /// If no icon is specified, it will inherit the icon name of the command.
    /// Please note that icons support dark and light themes. For example, set this property to "icon.png" and place two files "icon@light.png" and "icon@dark.png" in the resource folder.
    #[schemars(title = "The command's icon", pattern(r"\.(png|svg|jpg)$"))]
    pub icon: Option<String>,
}

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
    /// Unique identifier of the command triggered by this keybinding
    #[schemars(
        title = "The command's identifier",
        length(min = 2, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub command: String,
    /// The shortcut key, If there is a conflict with the previous shortcut key, the latter one separated by a space will be used as a replacement.
    /// ## Example
    /// "ctrl+p"
    /// "ctrl+p shift+p"
    #[schemars(
        title = "Default Keybinding",
        length(min = 1, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub key: String,
    /// Overrides default keybinding on macOS systems
    #[schemars(
        title = "macOS Keybinding",
        length(min = 1, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub mac: Option<String>,
    /// Overrides default keybinding on Windows systems
    #[schemars(
        title = "Windows Keybinding",
        length(min = 1, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub windows: Option<String>,
    /// Overrides default keybinding on Linux systems
    #[schemars(
        title = "Linux Keybinding",
        length(min = 1, max = 255),
        pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$")
    )]
    pub linux: Option<String>,
    /// Determines if shortcut works system-wide (true) or only in active window (false)
    /// If not specified, the keyboard shortcut will be triggered in the current window.
    #[schemars(title = "Global Scope")]
    pub global: Option<bool>,
    /// Boolean expression controlling when the keybinding is active
    #[schemars(title = "Activation Condition", length(min = 2, max = 255))]
    pub when: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Preference {
    pub title: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct View {
    pub command: Option<String>,
    pub label: String,
    pub title: Option<String>,
    pub icon: Option<String>,
    pub tools: Option<bool>,
    pub url: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Window {
    pub command: Option<String>,
    pub label: String,
    pub title: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Contributes {
    /// List of all commands vended by this extensions.
    #[schemars(title = "Executable extension's commands", length(max = 100))]
    pub commands: Option<Vec<Command>>,
    /// List of all palettes vended by this extensions.
    #[schemars(title = "Executable extension's palettes", length(max = 100))]
    pub palettes: Option<Vec<Palette>>,
    /// List of all keybindings vended by this extensions.
    #[schemars(title = "Executable extension's keybindings", length(max = 100))]
    pub keybindings: Option<Vec<Keybinding>>,
    pub preferences: Option<Preference>,
    pub actions: Option<String>,
    pub views: Option<Vec<View>>,
    pub window: Option<Vec<Window>>,
}
