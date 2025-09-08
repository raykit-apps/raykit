pub struct ExtensionStore {}

impl ExtensionStore {
    pub fn new() -> Self {
        Self {}
    }
}

impl ExtensionStore {
    /// 重新加载扩展
    pub fn reload(&self, modified_extension: &str) {
        // TODO: reload extensions
    }

    /// 获取扩展目录
    pub fn extensions_dir(&self) {
        // TODO: extensions_dir
    }

    /// 获取安装扩展
    pub fn install_extensions(&self) {
        // TODO: install extensions
    }

    /// 获取开发扩展
    pub fn dev_extensions(&self) {
        // TODO: dev extensions
    }

    /// 根据扩展ID获取扩展信息
    pub fn extension_manifest_for_id(&self, extension_id: &str) {
        // TODO: extension manifest for id
    }

    /// 获取扩展列表
    pub fn fetch_extensions(&self) {
        // TODO: fetch extensions
    }

    /// 获取有可用更新的扩展
    pub fn fetch_extensions_with_update_available(&self) {
        // TODO: fetch extensions with update available
    }

    /// 获取扩展版本
    pub fn fetch_extension_versions(&self, extension_id: &str) {
        // TODO: fetch extension versions
    }

    /// 自动安装扩展
    pub fn auto_install_extensions(&self) {
        // TODO: auto install extensions
    }

    /// 检查更新
    pub fn check_for_updates(&self) {
        // TODO: check for updates
    }

    /// 升级扩展
    fn upgrade_extensions(&self) {
        // TODO: upgrade extensions
    }

    /// 从API获取扩展
    fn fetch_extensions_from_api(&self) {
        // TODO: fetch extensions from api
    }
}
