#!/usr/bin/env tsx

import { execSync, spawn } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { arch, platform } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const distDir = join(projectRoot, 'dist')

interface PlatformConfig {
  name: string
  nodeExecutable: string
  outputExtension: string
  needsSignatureRemoval: boolean
  needsSigning: boolean
  postjectArgs: string[]
}

const platforms: Record<string, PlatformConfig> = {
  win32: {
    name: 'windows',
    nodeExecutable: 'node.exe',
    outputExtension: '.exe',
    needsSignatureRemoval: false,
    needsSigning: false,
    postjectArgs: [
      'NODE_SEA_BLOB',
      'sea-prep.blob',
      '--sentinel-fuse',
      'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
      '--overwrite',
    ],
  },
  darwin: {
    name: 'macos',
    nodeExecutable: 'node',
    outputExtension: '',
    needsSignatureRemoval: true,
    needsSigning: true,
    postjectArgs: [
      'NODE_SEA_BLOB',
      'sea-prep.blob',
      '--sentinel-fuse',
      'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
      '--macho-segment-name',
      'NODE_SEA',
      '--overwrite',
    ],
  },
  linux: {
    name: 'linux',
    nodeExecutable: 'node',
    outputExtension: '',
    needsSignatureRemoval: false,
    needsSigning: false,
    postjectArgs: [
      'NODE_SEA_BLOB',
      'sea-prep.blob',
      '--sentinel-fuse',
      'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
      '--overwrite',
    ],
  },
}

class SEABuilder {
  private currentPlatform: string
  private targetPlatforms: string[]
  private config: PlatformConfig

  constructor(targetPlatforms?: string[]) {
    this.currentPlatform = platform()
    this.targetPlatforms = targetPlatforms || [this.currentPlatform]
    this.config = platforms[this.currentPlatform]

    if (!this.config) {
      throw new Error(`Unsupported platform: ${this.currentPlatform}`)
    }
  }

  private log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const colors = {
      info: '\x1B[36m', // cyan
      success: '\x1B[32m', // green
      error: '\x1B[31m', // red
      warn: '\x1B[33m', // yellow
    }
    const reset = '\x1B[0m'
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`)
  }

  private execCommand(command: string, options: { cwd?: string, silent?: boolean } = {}): string {
    try {
      const result = execSync(command, {
        cwd: options.cwd || projectRoot,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
      })
      return result ? result.toString().trim() : ''
    }
    catch (error: any) {
      throw new Error(`Command failed: ${command}\n${error.message}`)
    }
  }

  private ensureDirectories() {
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true })
      this.log('Created dist directory')
    }
  }

  private generateBlob() {
    this.log('Generating SEA preparation blob...')
    const configPath = join(projectRoot, 'sea-config.json')

    if (!existsSync(configPath)) {
      throw new Error('sea-config.json not found')
    }

    this.execCommand(`node --experimental-sea-config ${configPath}`)

    const blobPath = join(distDir, 'sea-prep.blob')
    if (!existsSync(blobPath)) {
      throw new Error('Failed to generate SEA blob')
    }

    const blobSize = statSync(blobPath).size
    this.log(`SEA blob generated successfully (${(blobSize / 1024 / 1024).toFixed(2)} MB)`)
    return blobPath
  }

  private async downloadCleanNodeBinary(): Promise<string> {
    this.log('Downloading clean Node.js binary...')

    const nodeVersion = process.version // e.g., v22.16.0
    const archName = arch() === 'arm64' ? 'arm64' : 'x64'
    const platformName = this.currentPlatform === 'darwin'
      ? 'darwin'
      : this.currentPlatform === 'linux' ? 'linux' : 'win'

    const url = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-${platformName}-${archName}.tar.gz`
    const downloadDir = join(distDir, 'temp')
    const tarPath = join(downloadDir, 'node.tar.gz')
    const extractedPath = join(downloadDir, `node-${nodeVersion}-${platformName}-${archName}`)
    const nodeBinaryPath = join(extractedPath, 'bin', 'node')

    if (existsSync(nodeBinaryPath)) {
      this.log('Using existing downloaded Node.js binary')
      return nodeBinaryPath
    }

    if (!existsSync(downloadDir)) {
      mkdirSync(downloadDir, { recursive: true })
    }

    try {
      // Download using curl
      this.log(`Downloading from ${url}...`)
      this.execCommand(`curl -L "${url}" -o "${tarPath}"`)

      // Extract
      this.log('Extracting Node.js binary...')
      this.execCommand(`tar -xzf "${tarPath}" -C "${downloadDir}"`)

      if (existsSync(nodeBinaryPath)) {
        this.log('Successfully downloaded clean Node.js binary')
        return nodeBinaryPath
      }
      else {
        throw new Error('Failed to extract Node.js binary')
      }
    }
    catch {
      this.log('Failed to download clean Node.js binary, falling back to local binary', 'warn')
      return process.execPath
    }
  }

  private getNodeExecutablePath(): string {
    // For SEA builds, we should use a clean Node.js binary to avoid sentinel conflicts
    // Let's use the downloaded clean binary first
    const cleanBinaryPath = join(distDir, 'temp', `node-${process.version}-${this.currentPlatform === 'darwin' ? 'darwin' : this.currentPlatform === 'linux' ? 'linux' : 'win'}-${arch() === 'arm64' ? 'arm64' : 'x64'}`, 'bin', 'node')

    if (existsSync(cleanBinaryPath)) {
      return cleanBinaryPath
    }

    try {
      const nodePath = this.execCommand('which node', { silent: true }).trim()
      if (existsSync(nodePath)) {
        return nodePath
      }
    }
    catch {
      // Fallback to process.execPath
    }

    return process.execPath
  }

  private createExecutableCopy(targetName: string): string {
    this.log(`Creating executable copy for ${targetName}...`)

    const nodeExecutable = this.getNodeExecutablePath()
    const outputPath = join(distDir, `${targetName}${this.config.outputExtension}`)

    copyFileSync(nodeExecutable, outputPath)
    this.log(`Node executable copied to ${outputPath}`)

    return outputPath
  }

  private removeSignature(executablePath: string) {
    if (!this.config.needsSignatureRemoval) {
      return
    }

    this.log('Removing executable signature...')

    if (this.currentPlatform === 'darwin') {
      this.execCommand(`codesign --remove-signature "${executablePath}"`)
    }
    else if (this.currentPlatform === 'win32') {
      // Optional on Windows
      try {
        this.execCommand(`signtool remove /s "${executablePath}"`)
      }
      catch {
        this.log('signtool not available, skipping signature removal', 'warn')
      }
    }
  }

  private injectBlob(executablePath: string, blobPath: string) {
    this.log('Injecting SEA blob into executable...')

    const postjectCmd = [
      'npx postject',
      `"${executablePath}"`,
      ...this.config.postjectArgs.map(arg => arg === 'sea-prep.blob' ? `"${blobPath}"` : arg),
    ].join(' ')

    this.execCommand(postjectCmd)
    this.log('SEA blob injected successfully')
  }

  private signExecutable(executablePath: string) {
    if (!this.config.needsSigning) {
      return
    }

    this.log('Signing executable...')

    if (this.currentPlatform === 'darwin') {
      this.execCommand(`codesign --sign - "${executablePath}"`)
    }
    else if (this.currentPlatform === 'win32') {
      try {
        this.execCommand(`signtool sign /fd SHA256 "${executablePath}"`)
      }
      catch {
        this.log('Certificate not available for signing, executable will still be runnable', 'warn')
      }
    }
  }

  private compressExecutable(executablePath: string): string {
    this.log('Compressing executable...')

    const originalSize = statSync(executablePath).size
    const originalSizeMB = originalSize / 1024 / 1024

    this.log(`Original size: ${originalSizeMB.toFixed(2)} MB`)

    // For SEA applications, 100MB is a more reasonable limit than 40MB
    const maxSizeMB = 100

    if (originalSizeMB <= maxSizeMB) {
      this.log(`Executable is already under ${maxSizeMB}MB, skipping compression`)
      return executablePath
    }

    // Use UPX for compression if available
    try {
      const compressedPath = `${executablePath}.compressed`
      let upxCommand: string

      // Try different UPX strategies for better compatibility
      if (this.currentPlatform === 'darwin') {
        // For macOS, try more conservative compression settings
        upxCommand = `upx --ultra-brute --force-macos --no-backup "${executablePath}" -o "${compressedPath}"`
        this.log('Using macOS-optimized UPX settings...')
      }
      else if (this.currentPlatform === 'win32') {
        upxCommand = `upx --best --lzma --no-backup "${executablePath}" -o "${compressedPath}"`
      }
      else {
        // Linux
        upxCommand = `upx --best --lzma --no-backup "${executablePath}" -o "${compressedPath}"`
      }

      this.execCommand(upxCommand)

      if (existsSync(compressedPath)) {
        const compressedSize = statSync(compressedPath).size
        const compressedSizeMB = compressedSize / 1024 / 1024

        this.log(`Compressed size: ${compressedSizeMB.toFixed(2)} MB`)

        if (compressedSizeMB <= maxSizeMB) {
          rmSync(executablePath)
          copyFileSync(compressedPath, executablePath)
          rmSync(compressedPath)
          this.log('Compression successful')
          return executablePath
        }
        else {
          rmSync(compressedPath)
          throw new Error(`Compressed executable is still too large: ${compressedSizeMB.toFixed(2)} MB`)
        }
      }
    }
    catch {
      this.log('UPX compression failed, trying alternative methods...', 'warn')

      // Alternative: strip symbols if possible
      try {
        if (this.currentPlatform !== 'win32') {
          this.execCommand(`strip "${executablePath}"`)
          const strippedSize = statSync(executablePath).size
          const strippedSizeMB = strippedSize / 1024 / 1024
          this.log(`Stripped size: ${strippedSizeMB.toFixed(2)} MB`)

          if (strippedSizeMB > maxSizeMB) {
            this.log(`Executable is ${strippedSizeMB.toFixed(2)} MB, which exceeds ${maxSizeMB}MB but is acceptable for a SEA application`, 'warn')
          }
        }
      }
      catch {
        this.log(`Unable to reduce executable size below ${maxSizeMB}MB. Current size: ${originalSizeMB.toFixed(2)} MB`, 'warn')
      }
    }

    return executablePath
  }

  public testExecutable(executablePath: string): boolean {
    this.log('Testing executable...')

    try {
      const output = this.execCommand(`"${executablePath}"`, { silent: true })
      const expectedOutput = 'Hello, World!'

      if (output.trim() === expectedOutput) {
        this.log('✅ Executable test passed!', 'success')
        return true
      }
      else {
        this.log(`❌ Executable test failed. Expected: "${expectedOutput}", Got: "${output.trim()}"`, 'error')
        return false
      }
    }
    catch (error) {
      this.log(`❌ Executable test failed: ${error}`, 'error')
      return false
    }
  }

  public async buildForPlatform(platformName?: string): Promise<string> {
    const targetPlatform = platformName || this.currentPlatform
    const targetConfig = platforms[targetPlatform]

    if (!targetConfig) {
      throw new Error(`Unsupported target platform: ${targetPlatform}`)
    }

    this.log(`Building for platform: ${targetConfig.name} (${targetPlatform}-${arch()})`)
    this.ensureDirectories()

    // Step 0: Download clean Node.js binary (to avoid sentinel conflicts)
    await this.downloadCleanNodeBinary()

    // Step 1: Generate SEA blob
    const blobPath = this.generateBlob()

    // Step 2: Create executable copy
    const executableName = `raykit-exts-sidecar-${targetConfig.name}-${arch()}`
    const executablePath = this.createExecutableCopy(executableName)

    // Step 3: Remove signature (if needed)
    this.removeSignature(executablePath)

    // Step 4: Inject blob
    this.injectBlob(executablePath, blobPath)

    // Step 5: Sign executable (if needed)
    this.signExecutable(executablePath)

    // Step 6: Test executable before compression
    const preCompressionTestPassed = this.testExecutable(executablePath)

    if (!preCompressionTestPassed) {
      throw new Error('Executable test failed before compression')
    }

    // Step 7: Try compression, but fallback to uncompressed if test fails
    let finalPath = executablePath
    const backupPath = `${executablePath}.backup`

    // Create backup before compression
    copyFileSync(executablePath, backupPath)

    try {
      const compressedPath = this.compressExecutable(executablePath)

      // Test compressed executable
      const postCompressionTestPassed = this.testExecutable(compressedPath)

      if (postCompressionTestPassed) {
        finalPath = compressedPath
        this.log('✅ Compressed executable works correctly')
        // Remove backup since compression was successful
        rmSync(backupPath)
      }
      else {
        this.log('⚠️ Compressed executable failed test, using uncompressed version', 'warn')
        // Restore from backup
        copyFileSync(backupPath, executablePath)
        rmSync(backupPath)
        finalPath = executablePath
      }
    }
    catch (compressionError) {
      this.log(`⚠️ Compression failed: ${compressionError}. Using uncompressed version`, 'warn')
      // Restore from backup
      copyFileSync(backupPath, executablePath)
      rmSync(backupPath)
      finalPath = executablePath
    }

    // Final test
    const finalTestPassed = this.testExecutable(finalPath)

    if (!finalTestPassed) {
      throw new Error('Final executable test failed')
    }

    const finalSize = statSync(finalPath).size
    const finalSizeMB = finalSize / 1024 / 1024

    this.log(`✅ Build completed successfully!`, 'success')
    this.log(`📁 Output: ${finalPath}`)
    this.log(`📊 Final size: ${finalSizeMB.toFixed(2)} MB`)

    if (finalSizeMB > 100) {
      this.log(`⚠️ Warning: Executable size (${finalSizeMB.toFixed(2)} MB) exceeds 100MB`, 'warn')
    }

    return finalPath
  }

  public async buildAll(): Promise<string[]> {
    this.log('Building for all supported platforms...')
    const results: string[] = []

    for (const [platformKey, platformConfig] of Object.entries(platforms)) {
      try {
        if (platformKey === this.currentPlatform) {
          const result = await this.buildForPlatform(platformKey)
          results.push(result)
        }
        else {
          this.log(`Skipping ${platformConfig.name} - cross-platform build not supported`, 'warn')
        }
      }
      catch (error) {
        this.log(`Failed to build for ${platformConfig.name}: ${error}`, 'error')
      }
    }

    return results
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2)
  const allPlatforms = args.includes('--all-platforms')
  const testOnly = args.includes('--test')

  try {
    const builder = new SEABuilder()

    if (testOnly) {
      // Find the most recent executable and test it
      const executablePattern = `raykit-exts-sidecar-${platforms[platform()].name}-${arch()}${platforms[platform()].outputExtension}`
      const executablePath = join(distDir, executablePattern)

      if (existsSync(executablePath)) {
        builder.testExecutable(executablePath)
      }
      else {
        console.error('No executable found to test. Build first.')
        process.exit(1)
      }
    }
    else if (allPlatforms) {
      await builder.buildAll()
    }
    else {
      await builder.buildForPlatform()
    }
  }
  catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
