#!/usr/bin/env node
/**
 * raykit Package Creator Script
 *
 * Creates a new package in the packages/ directory following raykit's modular architecture.
 *
 * Usage:
 *   node create-package.ts [options] <package-name>
 *
 * Options:
 *   --common    Include common module
 *   --browser   Include browser module
 *   --main      Include main module
 *   --node       Include node module
 *   --all       Include all modules (default if no modules specified)
 *
 * Examples:
 *   node create-package.ts storage --all
 *   node create-package.ts file-utils --common --browser
 *   node create-package.ts window-manager --main --node
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// Parse command line arguments
function parseArgs(): { packageName: string, modules: string[] } {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Error: Package name is required')
    console.error('Usage: node create-package.ts [options] <package-name>')
    console.error('')
    console.error('Options:')
    console.error('  --common    Include common module')
    console.error('  --browser   Include browser module')
    console.error('  --main      Include main module')
    console.error('  --node       Include node module')
    console.error('  --all       Include all modules (default if no modules specified)')
    process.exit(1)
  }

  const modules: string[] = []
  const availableModules = ['common', 'browser', 'main', 'node']
  let packageName = ''

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const moduleName = arg.slice(2)
      if (moduleName === 'all') {
        modules.push(...availableModules)
      } else if (availableModules.includes(moduleName)) {
        modules.push(moduleName)
      }
    } else if (!arg.startsWith('-')) {
      packageName = arg
    }
  }

  if (!packageName) {
    console.error('Error: Package name is required')
    process.exit(1)
  }

  // If no modules specified, default to all
  if (modules.length === 0) {
    modules.push(...availableModules)
  }

  return { packageName, modules }
}

// Validate package name
function validatePackageName(name: string): string | null {
  // Must start with lowercase letter
  if (!/^[a-z]/.test(name)) {
    return 'Package name must start with a lowercase letter'
  }

  // Can only contain lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(name)) {
    return 'Package name can only contain lowercase letters, numbers, and hyphens'
  }

  // Cannot end with a hyphen
  if (name.endsWith('-')) {
    return 'Package name cannot end with a hyphen'
  }

  // Cannot have consecutive hyphens
  if (name.includes('--')) {
    return 'Package name cannot contain consecutive hyphens'
  }

  return null
}

// Main function
async function main() {
  const { packageName, modules } = parseArgs()

  // Validate package name
  const validationError = validatePackageName(packageName)
  if (validationError) {
    console.error(`Error: ${validationError}`)
    console.error(`Invalid package name: "${packageName}"`)
    console.error('')
    console.error('Valid examples:')
    console.error('  - core')
    console.error('  - file-utils')
    console.error('  - window-manager')
    process.exit(1)
  }

  // Determine project root by looking for packages directory and tsconfig.json
  function findProjectRoot(startDir: string): string {
    let currentDir = startDir

    while (currentDir !== path.dirname(currentDir)) {
      // Check if this directory has both packages/ and tsconfig.json
      const hasPackages = fs.existsSync(path.join(currentDir, 'packages'))
      const hasTsConfig = fs.existsSync(path.join(currentDir, 'tsconfig.json'))

      if (hasPackages && hasTsConfig) {
        return currentDir
      }

      currentDir = path.dirname(currentDir)
    }

    // Fallback: assume we're in .opencode/skills/... structure
    // Go up 4 levels from script location
    return path.resolve(__dirname, '..', '..', '..', '..')
  }

  const projectRoot = findProjectRoot(__dirname)

  // Define package directory
  const packageDir = path.join(projectRoot, 'packages', packageName)

  // Check if package already exists
  if (fs.existsSync(packageDir)) {
    console.error(`Error: Package "${packageName}" already exists at ${packageDir}`)
    process.exit(1)
  }

  console.log(`Creating package "${packageName}"...`)
  console.log(`Selected modules: ${modules.join(', ')}`)
  console.log('')

  // Create base directories
  fs.mkdirSync(packageDir, { recursive: true })
  fs.mkdirSync(path.join(packageDir, 'src'), { recursive: true })
  console.log(`  Created: ${path.relative(projectRoot, packageDir)}`)
  console.log(`  Created: ${path.relative(projectRoot, path.join(packageDir, 'src'))}`)

  // Create selected module directories
  for (const module of modules) {
    const moduleDir = path.join(packageDir, 'src', module)
    fs.mkdirSync(moduleDir, { recursive: true })
    console.log(`  Created: ${path.relative(projectRoot, moduleDir)}`)

    // Create module index.ts
    const indexPath = path.join(moduleDir, 'index.ts')
    const content = `/**
 * ${module.charAt(0).toUpperCase() + module.slice(1)} module for @raykit/${packageName}
 * 
 * This module contains ${module}-specific code for the ${packageName} package.
 */

export {};
`
    fs.writeFileSync(indexPath, content)
    console.log(`  Created: ${path.relative(projectRoot, indexPath)}`)
  }

  // Build exports configuration dynamically based on selected modules
  const exports: Record<string, string> = {}

  // Always export from common if it exists, otherwise use first available module
  const primaryModule = modules.includes('common') ? 'common' : modules[0]
  exports['.'] = `./src/${primaryModule}/index.ts`

  // Export each selected module
  for (const module of modules) {
    exports[`./${module}`] = `./src/${module}/index.ts`
  }

  // Create package.json with dynamic exports
  const packageJson: any = {
    name: `@raykit/${packageName}`,
    version: '0.0.1',
    private: true,
    exports,
    main: exports['.'],
    types: exports['.'],
    scripts: {},
    dependencies: {},
    devDependencies: {},
  }

  const packageJsonPath = path.join(packageDir, 'package.json')
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log(`  Created: ${path.relative(projectRoot, packageJsonPath)}`)

  // Create tsconfig.json (extending root config)
  const tsconfigJson = {
    extends: '../../tsconfig.json',
    compilerOptions: {},
    include: ['src/**/*'],
  }

  const tsconfigPath = path.join(packageDir, 'tsconfig.json')
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigJson, null, 2))
  console.log(`  Created: ${path.relative(projectRoot, tsconfigPath)}`)

  console.log('')
  console.log('✅ Package created successfully!')
  console.log('')
  console.log(`Package location: ${packageDir}`)
  console.log(`Package name: @raykit/${packageName}`)
  console.log(`Exported modules: ${modules.join(', ')}`)
  console.log('')
  console.log('Next steps:')
  console.log(`  1. Add dependencies to packages/${packageName}/package.json`)
  console.log(`  2. Implement your code in packages/${packageName}/src/*/index.ts`)
}

main().catch(console.error)
