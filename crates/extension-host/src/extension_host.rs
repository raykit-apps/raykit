use std::{path::PathBuf, sync::Arc};

use fs::Fs;

pub struct ExtensionStore {
    pub fs: Arc<dyn Fs>,
    pub index_path: PathBuf,
}

impl ExtensionStore {
    pub fn new(extensions_dir: PathBuf, fs: Arc<dyn Fs>) -> Self {
        let index_path = extensions_dir.join("extensions.json");

        let this = Self { fs, index_path };

        this
    }
}
