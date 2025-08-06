use std::collections::HashMap;

use schemars::JsonSchema;
use semver::Version;
use serde::{Deserialize, Serialize};

pub mod contribute;

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct ExtensionManifest {
    /// The name of the extension - should be all lowercase with no spaces.
    /// The name must be unique to the Marketplace.
    /// ## Example
    /// raykit-clipboard
    #[schemars(title = "", description = "")]
    pub name: String,
    /// SemVer compatible version.
    pub version: Version,
    /// The publisher identifier
    pub publisher: String,
    pub platform: Vec<String>,
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
    /// The path to the icon of at least 128x128 pixels (256x256 for Retina screens).
    pub icon: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct ContributesManifest {
    /// List of all commands vended by this extensions.
    #[schemars(title = "Executable extension's commands", length(max = 100))]
    pub command: Option<Vec<CommandManifest>>,
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
