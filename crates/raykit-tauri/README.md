# Raykit Tauri

This Tauri application includes an automatic Node.js binary download and compression system in the build script.

## Build Script Features

The `build.rs` script automatically:

1. **Downloads Node.js v22.17.0** for the current platform and architecture
2. **Follows Tauri sidecar naming conventions** (`node-{target-triple}{extension}`)
3. **Attempts UPX compression** to reduce binary size (if UPX is available)
4. **Verifies compressed binaries** and automatically falls back to uncompressed versions if they fail
5. **Caches downloads** in `.download/` to avoid re-downloading

## Supported Platforms

- **Windows**: `node-x86_64-pc-windows-msvc.exe` / `node-aarch64-pc-windows-msvc.exe`
- **macOS**: `node-aarch64-apple-darwin` / `node-x86_64-apple-darwin`
- **Linux**: `node-x86_64-unknown-linux-gnu` / `node-aarch64-unknown-linux-gnu`

## Dependencies

- **curl**: For downloading Node.js archives
- **tar** (Unix) / **PowerShell** (Windows): For extracting archives
- **upx** (optional): For binary compression

## Build Process

1. Check if Node.js binary already exists
2. If not, download the appropriate Node.js archive from nodejs.org
3. Extract the binary to `.download/`
4. Copy to `binaries/` with correct Tauri sidecar naming
5. Attempt UPX compression (skip if < 40MB or if UPX unavailable)
6. Verify compressed binary works, restore original if not

## File Structure

```
crates/raykit-tauri/
├── binaries/           # Tauri sidecar binaries
│   └── node-{triple}   # Node.js executables
├── .download/          # Download cache (git-ignored)
└── build.rs           # Build script with download logic
```

upx --best --lzma --force-macos --no-backup "node" -o "node-aarch64-apple-darwin"
