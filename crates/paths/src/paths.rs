use std::{path::PathBuf, sync::OnceLock};

pub fn home_dir() -> &'static PathBuf {
    static HOME_DIR: OnceLock<PathBuf> = OnceLock::new();
    HOME_DIR.get_or_init(|| {
        println!("Initializing home directory!");
        dirs::home_dir().expect("Failed to get home dir")
    })
}

pub fn config_dir() -> &'static PathBuf {
    static CONFIG_DIR: OnceLock<PathBuf> = OnceLock::new();
    CONFIG_DIR.get_or_init(|| {
        if cfg!(target_os = "windows") {
            dirs::config_dir()
                .expect("failed to determine RoamingAppData directory")
                .join("Raykit")
        } else if cfg!(any(target_os = "linux", target_os = "freebsd")) {
            if let Ok(flatpak_xdg_config) = std::env::var("FLATPAK_XDG_CONFIG_HOME") {
                flatpak_xdg_config.into()
            } else {
                dirs::config_dir().expect("failed to determine XDG_CONFIG_HOME directory")
            }
            .join("Raykit")
        } else {
            home_dir().join(".raykit").join("config")
        }
    })
}

pub fn data_dir() -> &'static PathBuf {
    static DATA_DIR: OnceLock<PathBuf> = OnceLock::new();
    DATA_DIR.get_or_init(|| {
        if cfg!(target_os = "macos") {
            home_dir().join("Library/Application Support/Raykit")
        } else if cfg!(any(target_os = "linux", target_os = "freebsd")) {
            if let Ok(flatpak_xdg_data) = std::env::var("FLATPAK_XDG_DATA_HOME") {
                flatpak_xdg_data.into()
            } else {
                dirs::data_local_dir().expect("failed to determine XDG_DATA_HOME directory")
            }
            .join("Raykit")
        } else if cfg!(target_os = "windows") {
            dirs::data_local_dir()
                .expect("failed to determine LocalAppData directory")
                .join("Raykit")
        } else {
            config_dir().clone() // Fallback
        }
    })
}

pub fn temp_dir() -> &'static PathBuf {
    static TEMP_DIR: OnceLock<PathBuf> = OnceLock::new();
    TEMP_DIR.get_or_init(|| {
        if cfg!(target_os = "macos") {
            dirs::cache_dir()
                .expect("failed to determine cachesDirectory directory")
                .join("Raykit")
        } else if cfg!(target_os = "windows") {
            dirs::cache_dir()
                .expect("failed to determine LocalAppData directory")
                .join("Raykit")
        } else if cfg!(any(target_os = "linux", target_os = "freebsd")) {
            if let Ok(flatpak_xdg_cache) = std::env::var("FLATPAK_XDG_CACHE_HOME") {
                flatpak_xdg_cache.into()
            } else {
                dirs::cache_dir().expect("failed to determine XDG_CACHE_HOME directory")
            }
            .join("raykit")
        } else {
            home_dir().join("cache")
        }
    })
}

pub fn extensions_dir() -> &'static PathBuf {
    static EXTENSIONS_DIR: OnceLock<PathBuf> = OnceLock::new();
    EXTENSIONS_DIR.get_or_init(|| home_dir().join(".raykit").join("extensions"))
}
