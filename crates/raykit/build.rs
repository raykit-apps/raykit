use flate2::read::GzDecoder;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tar::Archive;
use zip::ZipArchive;

const NODE_VERSION: &str = "22.17.0";

#[derive(Debug)]
struct PlatformConfig {
    name: String,
    compress: String,
    node_executable: String,
    output_extension: String,
}

impl PlatformConfig {
    fn for_current_platform() -> Self {
        match env::consts::OS {
            "windows" => PlatformConfig {
                name: "win".to_string(),
                compress: ".zip".to_string(),
                node_executable: "node.exe".to_string(),
                output_extension: ".exe".to_string(),
            },
            "macos" => PlatformConfig {
                name: "darwin".to_string(),
                compress: ".tar.gz".to_string(),
                node_executable: "node".to_string(),
                output_extension: "".to_string(),
            },
            "linux" => PlatformConfig {
                name: "linux".to_string(),
                compress: ".tar.gz".to_string(),
                node_executable: "node".to_string(),
                output_extension: "".to_string(),
            },
            _ => panic!("Unsupported platform: {}", env::consts::OS),
        }
    }

    fn get_arch() -> String {
        match env::consts::ARCH {
            "x86_64" => "x64".to_string(),
            "aarch64" => "arm64".to_string(),
            _ => "x64".to_string(), // 默认使用 x64
        }
    }

    fn get_target_triple() -> String {
        let output = Command::new("rustc")
            .args(["-vV"])
            .output()
            .expect("Failed to execute rustc -vV");

        let stdout = String::from_utf8(output.stdout).expect("Invalid UTF-8 output from rustc");

        for line in stdout.lines() {
            if line.starts_with("host: ") {
                return line.replace("host: ", "");
            }
        }

        panic!("Could not determine target triple from rustc -vV");
    }
}

fn main() {
    // 首先设置 Node.js 可执行文件
    setup_nodejs();

    // 然后运行 Tauri 构建
    tauri_build::build();
}

fn setup_nodejs() {
    let config = PlatformConfig::for_current_platform();
    let arch = PlatformConfig::get_arch();
    let target_triple = PlatformConfig::get_target_triple();

    let binaries_dir = Path::new("binaries");
    let download_dir = Path::new("binaries/.temp");

    // 创建目录
    fs::create_dir_all(binaries_dir).expect("Failed to create binaries directory");
    fs::create_dir_all(download_dir).expect("Failed to create download directory");

    // 根据 Tauri sidecar 命名规范生成最终文件名
    let final_executable_name = format!("node-{}{}", target_triple, config.output_extension);
    let final_path = binaries_dir.join(&final_executable_name);

    // 检查文件是否已存在
    if final_path.exists() {
        println!(
            "cargo:warning=Node.js executable already exists: {}",
            final_path.display()
        );
        return;
    }

    println!("cargo:warning=Downloading and setting up Node.js executable...");

    // 下载并提取 Node.js
    let node_binary_path = download_and_extract_nodejs(&config, &arch, download_dir);

    // 复制到目标位置
    fs::copy(&node_binary_path, &final_path).expect("Failed to copy Node.js binary to binaries directory");

    println!("cargo:warning=Node.js executable ready: {}", final_path.display());
}

fn download_and_extract_nodejs(config: &PlatformConfig, arch: &str, download_dir: &Path) -> PathBuf {
    let filename = format!("node-v{}-{}-{}{}", NODE_VERSION, config.name, arch, config.compress);
    let file_path = download_dir.join(&filename);
    let extracted_dir = download_dir.join(format!("node-v{}-{}-{}", NODE_VERSION, config.name, arch));

    let node_binary_path = if env::consts::OS == "windows" {
        extracted_dir.join(&config.node_executable)
    } else {
        extracted_dir.join("bin").join(&config.node_executable)
    };

    // 如果已经提取过，直接返回
    if node_binary_path.exists() {
        return node_binary_path;
    }

    // 下载文件
    if !file_path.exists() {
        let url = format!("https://nodejs.org/dist/latest-jod/{}", filename);
        println!("cargo:warning=Downloading Node.js from: {}", url);

        let status = Command::new("curl")
            .args(["-L", &url, "-o", &file_path.to_string_lossy()])
            .status()
            .expect("Failed to execute curl command");

        if !status.success() {
            panic!("Failed to download Node.js from {}", url);
        }
    }

    // 提取文件
    if !extracted_dir.exists() {
        extract_archive(&file_path, download_dir).unwrap_or_else(|e| panic!("Failed to extract archive: {}", e));
    }

    if !node_binary_path.exists() {
        panic!(
            "Node.js binary not found after extraction: {}",
            node_binary_path.display()
        );
    }

    node_binary_path
}

fn extract_archive(archive_path: &Path, output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let file = fs::File::open(archive_path)?;

    if archive_path.extension().and_then(|e| e.to_str()) == Some("zip") {
        let mut zip = ZipArchive::new(file)?;
        zip.extract(output_dir)?;
    } else if archive_path.extension().and_then(|e| e.to_str()) == Some("gz") {
        let tar = GzDecoder::new(file);
        let mut archive = Archive::new(tar);
        archive.unpack(output_dir)?;
    } else {
        return Err("Unsupported archive format".into());
    }

    Ok(())
}
