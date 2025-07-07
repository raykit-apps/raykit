pub struct Scanner {
    pub system_exts_location: String,
    pub user_exts_location: String,
    pub language: String,
    pub product_version: String,
}

impl Scanner {
    /// 按条件扫描所有扩展
    pub fn scan_all_exts(&self) {
        //
    }

    /// 按条件扫描系统扩展
    pub fn scan_system_exts(&self) {
        //
    }

    /// 按条件扫描用户扩展
    pub fn scan_user_exts(&self) {
        //
    }

    /// 扫描所有用户扩展
    /// 显示插件列表不管是否禁用或者失效
    pub fn scan_all_user_exts(&self) {
        //
    }

    /// 更新扩展中的元数据
    pub fn update_manifest_metadata(&self) {}

    /// 初始化用户扩展配置
    pub fn initialize_default_profile_exts(&self) {}
}

impl Scanner {
    /// 扫描开发中扩展
    pub fn scan_exts_under_development() {
        //
    }

    /// 扫描单个已知扩展
    /// 安装后扫描运行
    pub fn scan_existing_ext() {}

    /// 批量扫描指定路径的扩展
    pub fn scan_multiple_exts() {}

    /// 扫描单个扩展或目录下的多个扩展
    pub fn scan_one_or_multiple_ext() {}
}
