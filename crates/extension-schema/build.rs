use std::{env, fs, path::PathBuf};

use extension_manifest::ExtensionManifest;
use utils::fs::write_if_changed;

macro_rules! schema {
    ($name:literal, $path:ty) => {
        (concat!($name, ".schema.json"), schemars::schema_for!($path))
    };
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out = PathBuf::from(env::var("CARGO_MANIFEST_DIR")?);

    let schema_dir = out.join("schema");
    fs::create_dir_all(&schema_dir)?;

    let (filename, schema) = schema!("extension", ExtensionManifest);
    let schema = serde_json::to_string_pretty(&schema)?;
    write_if_changed(schema_dir.join(filename), schema)?;

    Ok(())
}
