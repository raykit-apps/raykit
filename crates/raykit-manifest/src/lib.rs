use std::collections::HashMap;

use schemars::JsonSchema;
use semver::Version;
use serde::{Deserialize, Serialize};

use crate::contribute::Contributes;

pub mod contribute;

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct Manifest {
    /// The name of the extension - should be all lowercase with no spaces.
    /// The name must be unique to the Marketplace.
    /// ## Example
    /// raykit-clipboard
    pub name: String,
    /// SemVer compatible version.
    pub version: Version,
    /// The publisher identifier
    pub publisher: String,
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
    pub contributes: Contributes,
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
