use std::sync::Arc;

use extension_manifest::ExtensionManifest;

pub mod extension_host_proxy;

#[async_trait::async_trait]
pub trait Extension: Send + Sync + 'static {
    /// Returns the [`ExtensionManifest`] for this extension.
    fn manifest(&self) -> Arc<ExtensionManifest>;
}
