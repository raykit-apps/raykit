use std::{path::PathBuf, sync::Arc};

use fs::Fs;
use tauri::{App, Manager, State};

pub mod js_host;

pub struct ExtensionStore {
    pub fs: Arc<dyn Fs>,
    pub index_path: PathBuf,
}

impl ExtensionStore {
    pub fn state(cx: &mut App) -> State<'_, ExtensionStore> {
        cx.state::<ExtensionStore>()
    }

    pub fn new(extensions_dir: PathBuf, fs: Arc<dyn Fs>) -> Self {
        let index_path = extensions_dir.join("extensions.json");

        let this = Self { fs, index_path };

        this
    }

    pub fn reload() {}
}

pub fn init(fs: Arc<dyn Fs>, cx: &mut App) {
    let store = ExtensionStore::new(paths::extensions_dir().clone(), fs);

    cx.manage(store);
}
