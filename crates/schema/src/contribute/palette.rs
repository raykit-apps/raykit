use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// command搜索匹配项
/// ## Example
/// {
///   "contributes": {
///     "palettes": [
///       {
///         "command": "myExtension.sayHello",
///         "when": "textMatch == *"
///       }
///     ]
///   }
/// }
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Palette {
    /// 匹配语句
    /// ## Example
    /// 匹配任意字符: textMatch == *
    /// 匹配多个字符串: textMatch == 'bing' ｜ 'google'
    /// 正则匹配字符: textMatch == \^https\
    /// 正则排除字符: textMatch != \^https\
    /// 匹配文件(扩展名): filesMatch == png
    /// 匹配多个文件: filesMatch == png | docx ｜ folder
    /// 窗口匹配: windowMatch == 'xxx.app'
    /// 复杂匹配: filesMatch == 'bing' && textMatch == \^https\
    pub when: String,
    pub command: String,
    pub title: Option<String>,
    pub icon: Option<String>,
}
