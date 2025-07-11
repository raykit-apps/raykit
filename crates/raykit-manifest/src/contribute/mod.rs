use crate::contribute::keybinding::Keybinding;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub mod keybinding;

/// 注册command命令
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Command {
    /// command id
    pub command: String,
    /// The display name of the command will be shown to users in the preferences interface and Raykit's root search function.
    pub title: String,
    /// The optional subtitle of the command in the root search.
    pub subtitle: Option<String>,
    /// It helps users understand what the command does. This information will be displayed in the preferences.
    pub description: String,
    /// 命令图标建议使用svg
    /// 默认为扩展icon
    #[schemars(pattern(r"\.(png|svg|jpg)$"))]
    pub icon: Option<String>,
}

/// command搜索匹配项
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
    pub command: String,
    pub when: String,
    pub lens: Option<[u32; 2]>,
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub icon: Option<String>,
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
    pub input: Option<bool>,
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
    pub commands: Option<Vec<Command>>,
    pub palettes: Option<Vec<Palette>>,
    pub keybindings: Option<Vec<Keybinding>>,
    pub preferences: Option<Preference>,
    pub actions: Option<String>,
    pub views: Option<Vec<View>>,
    pub window: Option<Vec<Window>>,
}
