use std::{collections::HashMap, path::Path, sync::Arc};

use anyhow::{Ok, Result};
use schemars::JsonSchema;
use semver::Version;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionManifest {
    /// The name of the extension, used as a unique identifier.
    /// Should be all lowercase, without spaces, e.g., "my-extension-name".
    /// This name must be unique within the Raykit Marketplace.
    #[schemars(
        title = "Extension Name",
        description = "Unique identifier for the extension (e.g., 'raykit-clipboard').",
        pattern(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$")
    )]
    pub name: String,

    /// The version of your extension, following Semantic Versioning (SemVer).
    /// ## Example
    /// "1.0.0"
    #[schemars(title = "Extension Version", description = "SemVer compatible version.")]
    pub version: Version,

    /// The unique identifier of the publisher. Must consist of only lowercase letters and numbers.
    #[schemars(
        title = "Publisher ID",
        description = "The unique identifier of the publisher. Must be all lowercase and contain only letters and numbers.",
        pattern(r"^[a-z0-9]+$")
    )]
    pub publisher: String,

    /// An array of platforms the extension is compatible with.
    /// If omitted, it's considered compatible with all.
    #[schemars(
        title = "Compatible Platforms",
        description = "A list of platforms the extension is compatible with. If omitted, it is assumed to be compatible with all."
    )]
    pub platform: Option<Vec<Platform>>,

    /// An object containing at least the Raykit key matching the versions of Raykit that the extension is compatible with.
    /// Cannot be *. For
    /// ## Example
    /// ^0.10.5 indicates compatibility with a minimum Raykit version of 0.10.5.
    pub engines: HashMap<String, Version>,

    /// Refer to npm's documentation.
    /// If you do have a LICENSE file in the root of your extension, the value for license should be "SEE LICENSE IN <filename>".
    pub license: Option<String>,
    /// The display name for the extension used in the Marketplace.
    /// The display name must be unique to the Marketplace.
    pub display_name: String,
    /// A short description of what your extension is and does.
    pub description: String,
    /// The categories you want to use for the extensions.
    pub categories: Vec<String>,
    /// An array of keywords to make it easier to find the extension.
    /// These are included with other extension Tags on the Marketplace.
    /// This list is currently limited to 30 keywords.
    pub keywords: Option<Vec<String>>,
    /// The entry point to your extension.
    pub main: String,
    /// An object describing the extension's contributions.
    pub contributes: ContributesManifest,
    /// An array of the activation events for this extension.
    pub activation_events: Vec<String>,
    /// Any runtime Node.js dependencies your extensions needs. Exactly the same as npm's dependencies.
    pub dependencies: Option<HashMap<String, Version>>,
    /// Any development Node.js dependencies your extension needs. Exactly the same as npm's devDependencies.
    pub dev_dependencies: Option<HashMap<String, Version>>,
    /// An array with the ids of extensions that can be installed together.
    /// The id of an extension is always ${publisher}.${name}.
    /// ## example
    /// raykit.raykit-clipboard
    pub extension_pack: Option<Vec<String>>,
    /// An array with the ids of extensions that this extension depends on.
    /// The id of an extension is always ${publisher}.${name}.
    /// ## example
    /// raykit.raykit-clipboard
    pub extension_dependencies: Option<Vec<String>>,

    /// Path to the extension's icon.
    /// Must be at least 128x128 pixels (256x256 recommended for high-DPI screens).
    #[schemars(
        title = "Icon Path",
        description = "Path to a 128x128px (or larger) icon for the extension."
    )]
    pub icon: String,
}

impl ExtensionManifest {
    pub async fn load(extension_dir: &Path) -> Result<()> {
        let mut extension_manifest_path = extension_dir.join("package.json");
        Ok(())
    }
}

/// Represents a compatible operating system platform.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Windows,
    Macos,
    Linux,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ContributesManifest {
    /// List of all commands vended by this extensions.
    #[schemars(title = "Executable extension's commands", length(max = 100))]
    pub commands: Option<Vec<CommandManifest>>,
    pub command_palettes: Option<Vec<CommandPaletteManifest>>,
    pub keybindings: Option<Vec<KeybindingManifest>>,
    pub preferences: Option<Vec<PreferenceManifest>>,
    pub views: Option<Vec<ViewManifest>>,
}

/// Represents a command definition for registration.
///
/// ## Example
///
/// {
///   "command": "open.url",
///   "title": "Open URL",
///   "description": "通过默认浏览器打开链接",
/// }
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct CommandManifest {
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
#[serde(rename_all = "camelCase")]
pub struct CommandPaletteManifest {
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
#[serde(rename_all = "camelCase")]
pub struct KeybindingManifest {
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
pub struct PreferenceManifest {
    pub name: String,
    pub title: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ViewManifest {
    pub command: Option<String>,
    pub label: String,
    pub title: Option<String>,
    pub icon: Option<String>,
    pub url: Option<bool>,
    pub tools: Option<bool>,
    pub window: Option<Window>,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Window {
    // TODO reference Tauri Window
}
