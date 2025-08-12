use anyhow::Result;
use std::path::{Path, PathBuf};

#[async_trait::async_trait]
pub trait Fs: Send + Sync {
    async fn create_dir(&self, path: &Path) -> Result<()>;
    async fn load(&self, path: &Path) -> Result<String> {
        Ok(String::from_utf8(self.load_bytes(path).await?)?)
    }
    async fn load_bytes(&self, path: &Path) -> Result<Vec<u8>>;
    fn home_dir(&self) -> Option<PathBuf>;
}

pub struct RealFs {}

impl RealFs {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait::async_trait]
impl Fs for RealFs {
    async fn create_dir(&self, path: &Path) -> Result<()> {
        Ok(tokio::fs::create_dir_all(path).await?)
    }

    async fn load_bytes(&self, path: &Path) -> Result<Vec<u8>> {
        Ok(tokio::fs::read(path).await?)
    }

    fn home_dir(&self) -> Option<PathBuf> {
        Some(paths::home_dir().clone())
    }
}
