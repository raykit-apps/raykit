use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

///
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Command {
    command: String,
    title: String,
    icon: String,
}
