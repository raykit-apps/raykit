use std::path::PathBuf;

use anyhow::Result;
use extension::extension_manifest::ExtensionManifest;
use utils::write_if_changed;

pub fn main() -> Result<()> {
    let out = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR")?);

    let schemas_dir = out.join("schemas");
    std::fs::create_dir_all(&schemas_dir)?;

    let schema = schemars::schema_for!(ExtensionManifest);

    let schema = serde_json::to_string_pretty(&schema)?;

    write_if_changed(schemas_dir.join("raykit.schema.json"), schema)?;

    Ok(())
}
