use std::{path::{Path, PathBuf}, time::SystemTime};
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[cfg(unix)]
use std::os::unix::fs::{FileTypeExt, MetadataExt};

#[async_trait::async_trait]
pub trait Fs: Send + Sync {
    async fn create_dir(&self, path: &Path) -> Result<()>;
    async fn load(&self, path: &Path) -> Result<String> {
        Ok(String::from_utf8(self.load_bytes(path).await?)?)
    }
    async fn load_bytes(&self, path: &Path) -> Result<Vec<u8>>;
    async fn is_file(&self, path: &Path) -> bool;
    async fn is_dir(&self, path: &Path) -> bool;
    async fn metadata(&self, path: &Path) -> Result<Option<Metadata>>;
    fn home_dir(&self) -> Option<PathBuf>;
}

#[derive(Copy, Clone, Debug)]
pub struct Metadata {
    pub inode: u64,
    pub mtime: MTime,
    pub is_symlink: bool,
    pub is_dir: bool,
    pub len: u64,
    pub is_fifo: bool,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(transparent)]
pub struct MTime(SystemTime);
