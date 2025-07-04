use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Color {
    id: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Command {
    command: String,
    title: String,
    icon: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Search {}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Keybinding {}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Configuration {}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct View {}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct ViewsContainer {}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Contributes {
    commands: Option<Vec<Command>>,
    searches: Option<Vec<Search>>,
    keybindings: Option<Vec<Keybinding>>,
    configuration: Option<Configuration>,
    actions: Option<String>,
    views: Option<Vec<View>>,
    views_containers: Option<Vec<ViewsContainer>>,
}
