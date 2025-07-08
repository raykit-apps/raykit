import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const distDir = join(projectRoot, 'dist')
const downloadDir = join(projectRoot, '.download')

const args = process.argv.slice(2)

const platform = os.platform()
const nodeVersion = '22.17.0'
const arch = os.arch() === 'arm64' ? 'arm64' : 'x64'

const compress = args.includes('--compress')

interface PlatformConfig {
  name: string
  compress: string
  nodeExecutable: string
  outputExtension: string
  needsSignatureRemoval: boolean
  needsSigning: boolean
  postjectArgs: string[]
}

const platforms: Record<string, PlatformConfig> = {
  win32: {
    name: 'win',
    compress: '.zip',
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
    name: 'darwin',
    compress: '.tar.gz',
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
    compress: '.tar.gz',
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

const currentPlatform = platforms[platform]
if (!currentPlatform) {
  throw new Error(`Unsupported platform: ${platform}`)
}

function execCommand(command: string, options: { cwd?: string, silent?: boolean } = {}): string {
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

function cleanBundle() {
  try {
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true, force: true })
      mkdirSync(distDir)
    }
    else {
      mkdirSync(distDir, { recursive: true })
    }
  }
  catch (error: any) {
    throw new Error(`mkdir failed: ${error.message}`)
  }
}

function generateSeaBlob() {
  const seaConfigPath = join(projectRoot, 'sea-config.json')

  if (!existsSync(seaConfigPath)) {
    throw new Error('sea-config.json not found')
  }

  execCommand(`node --experimental-sea-config ${seaConfigPath}`)

  const blobPath = join(distDir, 'sea-prep.blob')

  if (!existsSync(blobPath)) {
    throw new Error('Failed to generate SEA blob')
  }

  return blobPath
}

function getNodeBinaryPath(extractedPath: string): string {
  return platform === 'win32'
    ? join(extractedPath, currentPlatform.nodeExecutable)
    : join(extractedPath, 'bin', currentPlatform.nodeExecutable)
}

function downloadNodeBinary() {
  // 构造文件名和路径
  const fileName = `node-v${nodeVersion}-${currentPlatform.name}-${arch}${currentPlatform.compress}`
  const filePath = join(downloadDir, fileName)
  const extractedPath = join(downloadDir, `node-v${nodeVersion}-${currentPlatform.name}-${arch}`)
  const nodeBinaryPath = getNodeBinaryPath(extractedPath)

  if (existsSync(nodeBinaryPath)) {
    return nodeBinaryPath
  }

  // 确保下载目录存在
  if (!existsSync(downloadDir)) {
    mkdirSync(downloadDir, { recursive: true })
  }

  if (!existsSync(filePath)) {
    const url = `https://nodejs.org/dist/latest-jod/${fileName}`

    execCommand(`curl -L "${url}" -o "${filePath}" `, { cwd: downloadDir })
  }

  if (platform === 'win32') {
    execCommand(`powershell -Command "Expand-Archive -Path '${filePath}' -DestinationPath '${downloadDir}'"`)
  }
  else {
    execCommand(`tar -xzf "${filePath}" -C "${downloadDir}"`, { cwd: downloadDir })
  }

  if (existsSync(nodeBinaryPath)) {
    return nodeBinaryPath
  }
  else {
    throw new Error('Failed to extract Node.js binary')
  }
}

function copyNodeBinary(targetName: string): string {
  const outputPath = join(distDir, `${targetName}${currentPlatform.outputExtension}`)
  const extractedPath = join(downloadDir, `node-v${nodeVersion}-${currentPlatform.name}-${arch}`)
  const nodeExecutable = getNodeBinaryPath(extractedPath)

  copyFileSync(nodeExecutable, outputPath)

  return outputPath
}

function removeBinarySignature(executablePath: string) {
  if (!currentPlatform.needsSignatureRemoval) {
    return
  }

  if (platform === 'darwin') {
    execCommand(`codesign --remove-signature "${executablePath}"`)
  }
  else if (platform === 'win32') {
    // Optional on Windows
    execCommand(`signtool remove /s "${executablePath}"`)
  }
}

function injectSeaBlob(executablePath: string, blobPath: string) {
  const postjectCmd = [
    'npx postject',
    `"${executablePath}"`,
    ...currentPlatform.postjectArgs.map(arg => arg === 'sea-prep.blob' ? `"${blobPath}"` : arg),
  ].join(' ')

  execCommand(postjectCmd)
}

function signBinary(executablePath: string) {
  if (!currentPlatform.needsSigning) {
    return
  }

  if (platform === 'darwin') {
    execCommand(`codesign --sign - "${executablePath}"`)
  }
  else if (platform === 'win32') {
    execCommand(`signtool sign /fd SHA256 "${executablePath}"`)
  }
}

function compressExecutable(executablePath: string): string {
  const originalSize = statSync(executablePath).size
  const originalSizeMB = originalSize / 1024 / 1024

  console.log(`Original size: ${originalSizeMB.toFixed(2)} MB`)

  const maxSizeMB = 40
  if (originalSizeMB <= maxSizeMB) {
    console.log(`Executable is already under ${maxSizeMB}MB, skipping compression`)
    return executablePath
  }

  try {
    const compressedPath = `${executablePath}.compressed`
    let upxCommand: string

    if (platform === 'darwin') {
      upxCommand = `upx --ultra-brute --force-macos --no-backup "${executablePath}" -o "${compressedPath}"`
    }
    else if (platform === 'win32') {
      upxCommand = `upx --best --lzma --no-backup "${executablePath}" -o "${compressedPath}"`
    }
    else {
      upxCommand = `upx --best --lzma --no-backup "${executablePath}" -o "${compressedPath}"`
    }

    execCommand(upxCommand)

    if (existsSync(compressedPath)) {
      const compressedSize = statSync(compressedPath).size
      const compressedSizeMB = compressedSize / 1024 / 1024

      console.log(`Compressed size: ${compressedSizeMB.toFixed(2)} MB`)

      if (compressedSizeMB <= maxSizeMB) {
        rmSync(executablePath)
        copyFileSync(compressedPath, executablePath)
        rmSync(compressedPath)
        console.log('Compression successful')
        return executablePath
      }
      else {
        rmSync(compressedPath)
        throw new Error(`Compressed executable is still too large: ${compressedSizeMB.toFixed(2)} MB`)
      }
    }
  }
  catch (error: any) {
    throw new Error(`UPX compression failed: ${error.message}`)
  }

  return executablePath
}

function bundle() {
  // clean dist
  cleanBundle()

  // download node binary
  downloadNodeBinary()

  const blobPath = generateSeaBlob()

  const executableName = `exts-process`
  const executablePath = copyNodeBinary(executableName)

  removeBinarySignature(executablePath)

  injectSeaBlob(executablePath, blobPath)

  signBinary(executablePath)

  if (compress) {
    const finalPath = compressExecutable(executablePath)

    const finalSize = statSync(finalPath).size
    const finalSizeMB = finalSize / 1024 / 1024

    console.log(`✅ Build completed successfully!`, 'success')
    console.log(`📁 Output: ${finalPath}`)
    console.log(`📊 Final size: ${finalSizeMB.toFixed(2)} MB`)
  }
}

bundle()
