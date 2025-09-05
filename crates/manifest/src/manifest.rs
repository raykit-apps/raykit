use std::{ffi::OsStr, path::Path, sync::Arc};

use anyhow::{Context as _, Result};
use fs::Fs;
use schemars::JsonSchema;
use semver::Version;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionManifest {
    /// Unique identifier for the extension (e.g., 'raykit-clipboard').
    #[schemars(
        title = "The extension's name/identifier.",
        length(min = 3, max = 255),
        pattern(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$")
    )]
    pub name: String,
    #[schemars(title = "The human-friendly extension's name.", length(min = 2, max = 255))]
    pub title: String,
    /// SemVer compatible version.
    #[schemars(title = "The extension's version.")]
    pub version: Version,
    /// The unique identifier of the publisher. Must be all lowercase and contain only letters and numbers.
    #[schemars(
        title = "The extension's publisher ID.",
        length(min = 3, max = 255),
        pattern(r"^[a-z0-9]+$")
    )]
    pub publisher: String,
    /// The open-source licenses accepted currently
    #[schemars(title = "The extension's license.")]
    pub license: LicenseManifest,
    /// A short description of what your extension is and does.
    #[schemars(title = "The extension's description.", length(min = 12, max = 2048))]
    pub description: String,
    /// Path to a 128x128px (or larger) icon for the extension.
    #[schemars(title = "Icon Path", pattern(r"\.(png|svg|jpg)$"))]
    pub icon: String,
    /// An object describing the extension's contributions.
    #[schemars(title = "The extension's contributions.")]
    pub contributes: ContributesManifest,
}

#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema, PartialEq, Eq, Hash)]
pub enum LicenseManifest {
    #[serde(rename = "Apache-2.0")]
    Apache2_0,
    #[serde(rename = "BSD-2-Clause")]
    Bsd2Clause,
    #[serde(rename = "BSD-3-Clause")]
    Bsd3Clause,
    #[serde(rename = "GPL-2.0-only")]
    Gpl2_0,
    #[serde(rename = "GPL-3.0-only")]
    Gpl3_0,
    #[serde(rename = "ISC")]
    Isc,
    #[serde(rename = "LGPL-2.0-only")]
    Lgpl2_0,
    #[serde(rename = "LGPL-3.0-only")]
    Lgpl3_0,
    #[serde(rename = "MIT")]
    Mit,
}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ContributesManifest {
    /// List of all commands vended by this extensions.
    #[schemars(title = "Executable extension's commands", length(max = 100))]
    pub commands: Option<Vec<CommandManifest>>,
    pub views: Option<Vec<ViewsManifest>>,
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct CommandManifest {
    #[schemars(title = "", length(min = 2, max = 255), pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$"))]
    pub command: String,
    #[schemars(title = "", length(min = 2, max = 255))]
    pub title: String,
    #[schemars(title = "", length(min = 2, max = 255))]
    pub subtitle: Option<String>,
    #[schemars(title = "", length(min = 12, max = 2048))]
    pub description: String,
    #[schemars(title = "", pattern(r"\.(png|svg|jpg)$"))]
    pub icon: Option<String>,
    #[schemars(title = "")]
    pub keywords: Option<Vec<String>>,
    #[schemars(title = "")]
    pub when: Option<String>,
    #[schemars(title = "")]
    pub disabled_by_default: Option<bool>,
}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ViewsManifest {
    #[schemars(title = "", length(min = 2, max = 255), pattern(r"^[a-z0-9-~][a-zA-Z0-9-._~]*$"))]
    pub command: String,
    pub label: Option<String>,
    pub center: Option<bool>,
    pub drag_drop_enabled: Option<bool>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub min_width: Option<f64>,
    pub min_height: Option<f64>,
    pub max_width: Option<f64>,
    pub max_height: Option<f64>,
    pub resizable: Option<bool>,
    pub maximizable: Option<bool>,
    pub minimizable: Option<bool>,
}

impl ExtensionManifest {
    pub async fn load(fs: Arc<dyn Fs>, extension_dir: &Path) -> Result<Self> {
        let extension_name = extension_dir
            .file_name()
            .and_then(OsStr::to_str)
            .context("invalid extension name")?;

        let extension_manifest_path = extension_dir.join("package.json");
        if fs.is_file(&extension_manifest_path).await {
            let manifest_content = fs
                .load(&extension_manifest_path)
                .await
                .with_context(|| format!("failed to load {extension_name} package.json"))?;
            serde_json::from_str::<ExtensionManifest>(&manifest_content)
                .with_context(|| format!("invalid package.json for extension {extension_name}"))
        } else {
            anyhow::bail!("extension {} is missing required package.json file", extension_name)
        }
    }
}
