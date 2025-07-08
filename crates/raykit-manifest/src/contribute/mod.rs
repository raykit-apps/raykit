use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// 注册command命令
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Command {
    /// 命令ID
    pub command: String,
    /// 命令被搜索时显示的名称
    pub title: String,
    /// 命令副标题
    pub subtitle: Option<String>,
    /// 扩展描述，在设置中显示
    pub description: String,
    /// 命令图标建议使用svg
    /// 默认为扩展icon
    pub icon: Option<String>,
}

/// command搜索匹配项
/// ## Example
/// {
///   "contributes": {
///     "palettes": [
///       {
///         "command": "myExtension.sayHello",
///         "when": {
///           rule: "text == *",
///           lens: [1,1]
///         }
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
pub struct Keybinding {}

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
