use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::contribute::{
    command::Command, configuration::Configuration, keybinding::Keybinding, palette::Palette, view::View,
    view_container::ViewsContainer,
};

pub mod command;
pub mod configuration;
pub mod keybinding;
pub mod palette;
pub mod view;
pub mod view_container;

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Contributes {
    commands: Option<Vec<Command>>,
    palettes: Option<Vec<Palette>>,
    keybindings: Option<Vec<Keybinding>>,
    configuration: Option<Configuration>,
    actions: Option<String>,
    views: Option<Vec<View>>,
    views_containers: Option<Vec<ViewsContainer>>,
}
