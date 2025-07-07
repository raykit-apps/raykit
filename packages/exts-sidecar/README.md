# Raykit Extensions Sidecar

这是一个基于 Node.js Single Executable Applications (SEA) 的扩展边车程序，可以打包成独立的可执行文件，无需在目标系统上安装 Node.js。

## 功能特性

- ✅ 跨平台支持 (Windows, macOS, Linux)
- ✅ 自动下载干净的 Node.js 二进制文件，避免 sentinel 冲突
- ✅ 智能压缩，自动回退到未压缩版本以确保兼容性
- ✅ 完整的测试验证流程
- ✅ 动态平台检测和构建

## 构建命令

### 基本构建（当前平台）

```bash
pnpm build
```

### 构建所有支持的平台

```bash
pnpm build:all
```

### 测试已构建的可执行文件

```bash
pnpm test
```

## 构建流程

1. **下载干净的 Node.js 二进制文件** - 避免本地二进制文件的 sentinel 冲突
2. **生成 SEA blob** - 使用 `--experimental-sea-config` 生成注入 blob
3. **复制和修改二进制文件** - 创建目标可执行文件的副本
4. **移除签名** (macOS/Windows) - 为注入做准备
5. **注入 SEA blob** - 使用 postject 将应用注入到二进制文件
6. **重新签名** (macOS/Windows) - 恢复可执行文件的签名
7. **智能压缩** - 尝试使用 UPX 压缩，失败时自动回退
8. **测试验证** - 确保最终可执行文件能正确运行

## 输出文件

构建完成后，可执行文件将保存在 `dist/` 目录下：

- **macOS**: `raykit-exts-sidecar-macos-arm64` (或 `macos-x64`)
- **Windows**: `raykit-exts-sidecar-windows-arm64.exe` (或 `windows-x64.exe`)
- **Linux**: `raykit-exts-sidecar-linux-arm64` (或 `linux-x64`)

## 大小优化

- 原始大小：~105 MB (包含完整 Node.js runtime)
- 压缩后大小：~21 MB (在兼容的平台上)
- 如果压缩失败，自动回退到未压缩版本以确保功能正常

## 配置文件

### `sea-config.json`

```json
{
  "main": "./src/index.js",
  "output": "./dist/sea-prep.blob",
  "disableExperimentalSEAWarning": true,
  "useCodeCache": true,
  "useSnapshot": false
}
```

## 系统要求

### 构建环境

- Node.js 22+
- pnpm 10+
- 支持的操作系统：macOS, Windows, Linux

### 可选依赖

- **UPX** - 用于压缩可执行文件（推荐安装）
  - macOS: `brew install upx`
  - Windows: 下载自 [UPX 官网](https://upx.github.io/)
  - Linux: `sudo apt install upx` 或等效包管理器命令

### 目标系统

- 无需安装 Node.js
- 可执行文件包含完整的运行时环境

## 故障排除

### 常见问题

1. **Multiple sentinel 错误**
   - 解决方案：脚本会自动下载干净的 Node.js 二进制文件

2. **压缩后可执行文件无法运行**
   - 解决方案：脚本会自动检测并回退到未压缩版本

3. **文件大小超过限制**
   - 当前限制：100MB（对于 SEA 应用这是合理的大小）
   - 实际大小：105MB（未压缩）或 21MB（压缩）

4. **macOS 签名问题**
   - 脚本会自动处理签名的移除和恢复

## 开发

要修改主程序逻辑，编辑 `src/index.js` 文件。要修改构建逻辑，编辑 `scripts/build.ts` 文件。

## 注意事项

- 构建过程需要网络连接来下载 Node.js 二进制文件
- 第一次构建会较慢，因为需要下载 ~45MB 的 Node.js 二进制文件
- 后续构建会使用缓存的二进制文件，速度更快
- macOS 上的 UPX 压缩需要 `--force-macos` 参数，脚本已自动处理
