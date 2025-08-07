// use std::collections::HashMap;

// use schemars::JsonSchema;
// use semver::Version;
// use serde::{Deserialize, Serialize};
// use serde_json::Value;

// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct ExtensionManifest {
//     /// The name of the extension, used as a unique identifier.
//     /// Should be all lowercase, without spaces, e.g., "my-extension-name".
//     /// This name must be unique within the Raykit Marketplace.
//     #[schemars(
//         title = "Extension Name",
//         description = "Unique identifier for the extension (e.g., 'raykit-clipboard').",
//         pattern = r"^[a-z0-9][a-z0-9-]*[a-z0-9]$"
//     )]
//     pub name: String,

//     /// The version of your extension, following Semantic Versioning (SemVer).
//     /// ## Example
//     /// "1.0.0"
//     #[schemars(title = "Extension Version", description = "SemVer compatible version.")]
//     pub version: Version,

//     /// The unique identifier of the publisher.
//     #[schemars(title = "Publisher ID")]
//     pub publisher: String,

//     /// An array of platforms the extension is compatible with.
//     /// For example: ["windows", "macos", "linux"]. If omitted, it's considered compatible with all.
//     #[schemars(title = "Compatible Platforms")]
//     pub platform: Option<Vec<String>>,

//     /// A map of engines the extension is compatible with.
//     /// Must include a "raykit" key with a SemVer range specifying compatible Raykit versions.
//     /// ## Example
//     /// `{"raykit": "^0.10.5"}` indicates compatibility with Raykit versions >= 0.10.5 and < 0.11.0.
//     #[schemars(
//         title = "Engine Compatibility",
//         description = "Specifies compatibility with host applications, e.g., {\"raykit\": \"^1.0.0\"}."
//     )]
//     pub engines: HashMap<String, String>,

//     /// The license for the extension.
//     /// For standard licenses, use the SPDX identifier (e.g., "MIT").
//     /// If you have a custom license file, use "SEE LICENSE IN <filename>", e.g., "SEE LICENSE IN LICENSE.md".
//     #[schemars(title = "License")]
//     pub license: Option<String>,

//     /// The human-readable name for the extension shown in the UI.
//     /// This name must be unique within the Raykit Marketplace.
//     #[schemars(title = "Display Name", description = "The name shown in the Marketplace.")]
//     pub display_name: String,

//     /// A concise description of the extension's purpose and functionality.
//     #[schemars(
//         title = "Description",
//         description = "A short description of what your extension does."
//     )]
//     pub description: String,

//     /// Categories from a predefined list that the extension belongs to.
//     /// Helps with discovery in the Marketplace. e.g., ["Developer Tools", "Themes"].
//     #[schemars(title = "Categories")]
//     pub categories: Vec<String>,

//     /// An array of keywords for discoverability in the Marketplace.
//     /// Limited to a maximum of 30 keywords.
//     #[schemars(
//         title = "Keywords",
//         description = "Keywords to aid in Marketplace search.",
//         length(max = 30)
//     )]
//     pub keywords: Option<Vec<String>>,

//     /// The path to the main entry point file for your extension.
//     #[schemars(title = "Main Entry Point", description = "e.g., 'dist/main.js'")]
//     pub main: String,

//     /// An object describing all contributions of this extension to Raykit.
//     #[schemars(title = "Contributions")]
//     pub contributes: ContributesManifest,

//     /// An array of events that will activate the extension.
//     /// ## Example
//     /// `["onCommand:myExtension.myCommand", "onStartup"]`
//     #[schemars(title = "Activation Events")]
//     pub activation_events: Vec<String>,

//     /// Runtime Node.js dependencies, similar to npm's `dependencies`.
//     #[schemars(title = "Dependencies")]
//     pub dependencies: Option<HashMap<String, String>>,

//     /// Development-time Node.js dependencies, similar to npm's `devDependencies`.
//     #[schemars(title = "Development Dependencies")]
//     pub dev_dependencies: Option<HashMap<String, String>>,

//     /// Use this to bundle a set of extensions together.
//     /// The ID of an extension is `${publisher}.${name}`.
//     #[schemars(
//         title = "Extension Pack",
//         description = "An array of extension IDs that are bundled with this extension."
//     )]
//     pub extension_pack: Option<Vec<String>>,

//     /// An array of extension IDs that this extension depends on.
//     /// These extensions will be installed automatically alongside this one.
//     /// The ID of an extension is `${publisher}.${name}`.
//     #[schemars(
//         title = "Extension Dependencies",
//         description = "An array of extension IDs that this extension depends on."
//     )]
//     pub extension_dependencies: Option<Vec<String>>,

//     /// Path to the extension's icon.
//     /// Must be at least 128x128 pixels (256x256 recommended for high-DPI screens).
//     #[schemars(
//         title = "Icon Path",
//         description = "Path to a 128x128px (or larger) icon for the extension."
//     )]
//     pub icon: String,
// }

// /// Defines all the contributions an extension can make to the Raykit UI and functionality.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct ContributesManifest {
//     /// A list of all commands contributed by this extension.
//     #[schemars(
//         title = "Commands",
//         description = "List of all commands vended by this extension.",
//         length(max = 100)
//     )]
//     pub commands: Option<Vec<CommandManifest>>,

//     /// A list of commands to be displayed in the root search command palette.
//     #[schemars(
//         title = "Command Palettes",
//         description = "Commands to show in the main command palette."
//     )]
//     pub command_palettes: Option<Vec<CommandPaletteManifest>>,

//     /// A list of default keybindings for commands.
//     #[schemars(
//         title = "Keybindings",
//         description = "Contributions of default keyboard shortcuts."
//     )]
//     pub keybindings: Option<Vec<KeybindingManifest>>,

//     /// A list of settings that the user can configure.
//     #[schemars(
//         title = "Preferences",
//         description = "Contributions to user-configurable settings."
//     )]
//     pub preferences: Option<Vec<PreferenceSection>>,

//     /// A list of custom views, such as sidebars or webviews.
//     #[schemars(
//         title = "Views",
//         description = "Contributions of custom views like sidebars or panels."
//     )]
//     pub views: Option<Vec<ViewManifest>>,
// }

// /// Represents a single command that can be executed within Raykit.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct CommandManifest {
//     /// Unique identifier for the command, e.g., "myExtension.sayHello".
//     #[schemars(
//         title = "Command ID",
//         description = "Unique identifier for the command.",
//         length(min = 2, max = 255),
//         pattern = r"^[a-z0-9-~][a-zA-Z0-9-._~]*$"
//     )]
//     pub command: String,

//     /// The human-friendly name of the command.
//     /// This is displayed in places like the Command Palette and Preferences.
//     #[schemars(
//         title = "Title",
//         description = "The human-friendly name of the command.",
//         length(min = 2, max = 255)
//     )]
//     pub title: String,

//     /// Optional subtitle for the command, providing extra context in the root search UI.
//     #[schemars(
//         title = "Subtitle",
//         description = "Supplemental text for the command, shown in root search results.",
//         length(min = 2, max = 255)
//     )]
//     pub subtitle: Option<String>,

//     /// A detailed explanation of what the command does, shown in Preferences.
//     #[schemars(
//         title = "Description",
//         description = "A detailed explanation of the command's functionality.",
//         length(min = 12, max = 2048)
//     )]
//     pub description: String,

//     /// Path to an icon for the command. Displayed in Preferences and Root Search.
//     /// Inherits the extension's icon if not provided. Supports light/dark themes
//     /// (e.g., "icon.svg" will use "icon@light.svg" and "icon@dark.svg" if they exist).
//     /// Recommended format is SVG.
//     #[schemars(
//         title = "Icon",
//         description = "Path to the command's icon. Inherits extension icon if omitted.",
//         pattern = r"\.(png|svg|jpg|jpeg)$"
//     )]
//     pub icon: Option<String>,

//     /// If set to `true`, the command will be disabled by default and the user must enable it.
//     /// Defaults to `false`.
//     #[schemars(
//         title = "Disabled by Default",
//         description = "Whether the command is disabled by default."
//     )]
//     pub disabled_by_default: Option<bool>,
// }

// /// Configures how a command appears in the root search command palette.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct CommandPaletteManifest {
//     /// The identifier of the command to execute. Must match a command in the `commands` contribution.
//     #[schemars(
//         title = "Command ID",
//         description = "Identifier of the command to be shown in the palette.",
//         length(min = 2, max = 255),
//         pattern = r"^[a-z0-9-~][a-zA-Z0-9-._~]*$"
//     )]
//     pub command: String,

//     /// A condition that must be true for this palette entry to be shown.
//     /// This allows for context-sensitive commands. e.g., "view == 'editor'".
//     #[schemars(
//         title = "When Clause",
//         description = "A condition for when this command should appear in the palette."
//     )]
//     pub when: Option<String>,

//     /// An optional range `[start, end]` to apply a special style or 'lens' effect to the title in the UI.
//     #[schemars(
//         title = "Title Lens",
//         description = "An optional [start, end] range to apply a special style to the title."
//     )]
//     pub lens: Option<[u32; 2]>,

//     /// Overrides the command's default title when shown in the command palette.
//     #[schemars(
//         title = "Title Override",
//         description = "Optional title to override the command's default title in the palette.",
//         length(min = 2, max = 255)
//     )]
//     pub title: Option<String>,

//     /// Overrides the command's default subtitle when shown in the command palette.
//     #[schemars(
//         title = "Subtitle Override",
//         description = "Optional subtitle to override the command's default subtitle in the palette.",
//         length(min = 2, max = 255)
//     )]
//     pub subtitle: Option<String>,

//     /// Overrides the command's default icon when shown in the command palette.
//     #[schemars(
//         title = "Icon Override",
//         description = "Optional icon to override the command's default icon in the palette.",
//         pattern = r"\.(png|svg|jpg|jpeg)$"
//     )]
//     pub icon: Option<String>,
// }

// /// Defines a keyboard shortcut for a command.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct KeybindingManifest {
//     /// The identifier of the command to execute when the key is pressed.
//     #[schemars(
//         title = "Command ID",
//         description = "Identifier of the command to trigger.",
//         length(min = 2, max = 255),
//         pattern = r"^[a-z0-9-~][a-zA-Z0-9-._~]*$"
//     )]
//     pub command: String,

//     /// The key combination. Modifiers (`ctrl`, `alt`, `shift`, `cmd`) are joined by `+`.
//     /// ## Example
//     /// `"ctrl+shift+p"`
//     #[schemars(
//         title = "Default Keybinding",
//         description = "The key combination, e.g., 'ctrl+shift+k'.",
//         length(min = 1, max = 255)
//     )]
//     pub key: String,

//     /// macOS-specific keybinding to override the default. Use `cmd` for the Command key.
//     #[schemars(
//         title = "macOS Keybinding",
//         description = "macOS-specific override, e.g., 'cmd+shift+p'.",
//         length(min = 1, max = 255)
//     )]
//     pub mac: Option<String>,

//     /// Windows-specific keybinding to override the default.
//     #[schemars(
//         title = "Windows Keybinding",
//         description = "Windows-specific override.",
//         length(min = 1, max = 255)
//     )]
//     pub windows: Option<String>,

//     /// Linux-specific keybinding to override the default.
//     #[schemars(
//         title = "Linux Keybinding",
//         description = "Linux-specific override.",
//         length(min = 1, max = 255)
//     )]
//     pub linux: Option<String>,

//     /// If `true`, the shortcut works globally (system-wide). If `false` or omitted, it's only active when the app is focused.
//     #[schemars(
//         title = "Global Scope",
//         description = "If true, shortcut works system-wide. Defaults to false (app-focused)."
//     )]
//     pub global: Option<bool>,

//     /// A condition that must be true for the keybinding to be active.
//     /// Allows for context-sensitive shortcuts. e.g., "editorFocus".
//     #[schemars(
//         title = "When Clause",
//         description = "A condition when the keybinding is active.",
//         length(min = 2, max = 255)
//     )]
//     pub when: Option<String>,
// }

// /// Represents a section in the user preferences UI.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// pub struct PreferenceSection {
//     /// The title of this preference section, displayed in the UI.
//     #[schemars(title = "Section Title", description = "The title for this group of settings.")]
//     pub title: String,

//     /// A map of preference keys to their definitions.
//     #[schemars(
//         title = "Properties",
//         description = "A map of setting IDs to their configuration."
//     )]
//     pub properties: HashMap<String, PreferenceItem>,
// }

// /// The data type of a preference item.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub enum PreferenceType {
//     String,
//     Number,
//     Boolean,
//     /// Represents a dropdown with a list of predefined string values.
//     Enum,
// }

// /// Defines a single, user-configurable preference item.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct PreferenceItem {
//     /// The data type for the preference value.
//     #[serde(rename = "type")]
//     #[schemars(title = "Type", description = "The data type of the setting.")]
//     pub preference_type: PreferenceType,

//     /// The human-friendly label for this preference.
//     #[schemars(title = "Label", description = "The name of the setting shown in the UI.")]
//     pub label: String,

//     /// A detailed description of what this preference controls.
//     #[schemars(
//         title = "Description",
//         description = "A detailed explanation of what this setting does."
//     )]
//     pub description: Option<String>,

//     /// The default value for this preference. Must match the specified `type`.
//     /// For `boolean`, use `true` or `false`. For `number`, use a numeric literal. For `string`, use a string.
//     #[schemars(
//         title = "Default Value",
//         description = "The default value for the setting."
//     )]
//     pub default: Option<Value>,

//     /// If `type` is `enum`, this is the list of allowed string values.
//     #[schemars(
//         title = "Enum Values",
//         description = "If the type is 'enum', this provides the list of possible values."
//     )]
//     pub enum_values: Option<Vec<String>>,
// }

// /// Defines a custom view, such as a sidebar panel or a webview.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct ViewManifest {
//     /// The command to execute to show/hide this view.
//     #[schemars(title = "Command", description = "Command to toggle the view's visibility.")]
//     pub command: Option<String>,

//     /// The human-readable label for the view, e.g., shown in a sidebar's header.
//     #[schemars(title = "Label", description = "The human-readable label for the view.")]
//     pub label: String,

//     /// The title of the view, used as the window title if it's a separate window.
//     #[schemars(
//         title = "Title",
//         description = "The title of the view, e.g., for a window's title bar."
//     )]
//     pub title: Option<String>,

//     /// Path to the view's icon.
//     #[schemars(title = "Icon", description = "Path to an icon for the view.")]
//     pub icon: Option<String>,

//     /// If `true`, the view is hosted in a webview with the specified `main` entry point.
//     #[schemars(
//         title = "Is Webview",
//         description = "Indicates if the view is a webview."
//     )]
//     pub url: Option<bool>,

//     /// If `true`, developer tools are enabled for this view by default.
//     #[schemars(
//         title = "Enable DevTools",
//         description = "Whether to enable developer tools for this view."
//     )]
//     pub tools: Option<bool>,

//     /// If defined, the view opens in a new window with these specific properties.
//     #[schemars(
//         title = "Window Properties",
//         description = "Configuration for opening the view in a new window."
//     )]
//     pub window: Option<Window>,
// }

// /// Defines the properties of a new window for a view.
// /// Based on common properties from frameworks like Tauri.
// #[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
// #[serde(rename_all = "camelCase")]
// pub struct Window {
//     /// The title of the window.
//     #[schemars(title = "Window Title")]
//     pub title: Option<String>,

//     /// The initial width of the window.
//     #[schemars(title = "Width")]
//     pub width: Option<f64>,

//     /// The initial height of the window.
//     #[schemars(title = "Height")]
//     pub height: Option<f64>,

//     /// The minimum width of the window.
//     #[schemars(title = "Min Width")]
//     pub min_width: Option<f64>,

//     /// The minimum height of the window.
//     #[schemars(title = "Min Height")]
//     pub min_height: Option<f64>,

//     /// The maximum width of the window.
//     #[schemars(title = "Max Width")]
//     pub max_width: Option<f64>,

//     /// The maximum height of the window.
//     #[schemars(title = "Max Height")]
//     pub max_height: Option<f64>,

//     /// The initial x-coordinate of the window's position.
//     #[schemars(title = "X Position")]
//     pub x: Option<f64>,

//     /// The initial y-coordinate of the window's position.
//     #[schemars(title = "Y Position")]
//     pub y: Option<f64>,

//     /// If `true`, centers the window on the screen.
//     #[schemars(title = "Center on Screen")]
//     pub center: Option<bool>,

//     /// Whether the window is resizable. Defaults to `true`.
//     #[schemars(title = "Resizable")]
//     pub resizable: Option<bool>,

//     /// Whether the window should be fullscreen.
//     #[schemars(title = "Fullscreen")]
//     pub fullscreen: Option<bool>,

//     /// Whether the window has decorations (title bar, borders). Defaults to `true`.
//     #[schemars(title = "Decorations")]
//     pub decorations: Option<bool>,

//     /// Whether the window should have a transparent background.
//     #[schemars(title = "Transparent Background")]
//     pub transparent: Option<bool>,

//     /// Whether the window should always be on top of other windows.
//     #[schemars(title = "Always on Top")]
//     pub always_on_top: Option<bool>,
// }
