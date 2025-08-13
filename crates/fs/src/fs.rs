use anyhow::Result;
use std::path::{Path, PathBuf};

#[async_trait::async_trait]
pub trait Fs: Send + Sync {
    async fn create_dir(&self, path: &Path) -> Result<()>;
    async fn load(&self, path: &Path) -> Result<String> {
        Ok(String::from_utf8(self.load_bytes(path).await?)?)
    }
    async fn load_bytes(&self, path: &Path) -> Result<Vec<u8>>;
    async fn is_file(&self, path: &Path) -> bool;
    async fn is_dir(&self, path: &Path) -> bool;
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

    async fn is_file(&self, path: &Path) -> bool {
        tokio::fs::metadata(path)
            .await
            .map_or(false, |metadata| metadata.is_file())
    }

    async fn is_dir(&self, path: &Path) -> bool {
        tokio::fs::metadata(path)
            .await
            .map_or(false, |metadata| metadata.is_dir())
    }

    fn home_dir(&self) -> Option<PathBuf> {
        Some(paths::home_dir().clone())
    }
}
