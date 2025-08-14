use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::{
    io,
    path::{Path, PathBuf},
    time::SystemTime,
};

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

    async fn metadata(&self, path: &Path) -> Result<Option<Metadata>> {
        let symlink_metadata = match tokio::fs::symlink_metadata(path).await {
            Ok(metadata) => metadata,
            Err(err) => {
                return match (err.kind(), err.raw_os_error()) {
                    (io::ErrorKind::NotFound, _) => Ok(None),
                    (io::ErrorKind::Other, Some(libc::ENOTDIR)) => Ok(None),
                    _ => Err(anyhow::Error::new(err)),
                };
            }
        };

        let path_exists = {
            let path_buf = path.to_path_buf();
            tokio::task::spawn_blocking(move || {
                path_buf
                    .try_exists()
                    .with_context(|| format!("checking existence for path {path_buf:?}"))
            })
            .await?
            .context("spawn_blocking for try_exists failed")?
        };

        let is_symlink = symlink_metadata.file_type().is_symlink();
        let metadata = match (is_symlink, path_exists) {
            (true, true) => tokio::fs::metadata(path)
                .await
                .with_context(|| format!("accessing symlink for path {path:?}"))?,
            _ => symlink_metadata,
        };

        #[cfg(unix)]
        let inode = metadata.ino();

        #[cfg(windows)]
        let inode = file_id(path).await?;

        #[cfg(windows)]
        let is_fifo = false;

        #[cfg(unix)]
        let is_fifo = metadata.file_type().is_fifo();

        Ok(Some(Metadata {
            inode,
            mtime: MTime(metadata.modified().unwrap()),
            len: metadata.len(),
            is_symlink,
            is_dir: metadata.file_type().is_dir(),
            is_fifo,
        }))
    }

    fn home_dir(&self) -> Option<PathBuf> {
        Some(paths::home_dir().clone())
    }
}

#[cfg(target_os = "windows")]
async fn file_id(path: impl AsRef<Path>) -> Result<u64> {
    use file_id::FileId;

    let path_buf = path.as_ref().to_path_buf();

    tokio::task::spawn_blocking(move || {
        let file_id = file_id::get_low_res_file_id(&path_buf)?;
        match file_id {
            FileId::LowRes { file_index, .. } => Ok(file_index),
            _ => Err(anyhow::anyhow!(
                "Unsupported FileId type returned for path {path_buf:?}. Expected LowRes variant."
            )),
        }
    })
    .await?
}
