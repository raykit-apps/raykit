## 1. Package Setup and Configuration

- [x] 1.1 Create packages/sandbox directory structure
- [x] 1.2 Create package.json with proper exports (., ./preload, ./preload-aux, ./common)
- [x] 1.3 Create tsconfig.json extending root config
- [x] 1.4 Install peer dependency: electron (catalog:)

## 2. Common Types (src/common/)

- [x] 2.1 Create src/common/sandbox-types.ts with ISandboxConfiguration interface
- [x] 2.2 Create src/common/electron-types.ts with IpcRenderer, WebFrame, WebUtils, ProcessMemoryInfo types
- [x] 2.3 Create src/common/index.ts exporting all common types

## 3. Browser Globals (src/browser/)

- [x] 3.1 Create src/browser/globals.ts with window.raykit type definitions and API exports
- [x] 3.2 Create src/browser/index.ts exporting ipcRenderer, webFrame, process, context for renderer use
- [x] 3.3 Add TypeScript global augmentation for window.raykit

## 4. Main Preload Script (src/browser/preload.ts)

- [x] 4.1 Implement validateIPC function requiring 'raykit:' prefix
- [x] 4.2 Implement parseArgv function to extract --raykit-window-config
- [x] 4.3 Implement resolveConfiguration promise to fetch config from main process
- [x] 4.4 Implement resolveShellEnv promise to fetch shell environment
- [x] 4.5 Create globals object with full ipcRenderer API (send/invoke/on/once/removeListener)
- [x] 4.6 Add webFrame with setZoomLevel to globals
- [x] 4.7 Add webUtils with getPathForFile to globals
- [x] 4.8 Add process with platform/arch/env/cwd/shellEnv/getProcessMemoryInfo/on to globals
- [x] 4.9 Add context with configuration()/resolveConfiguration() to globals
- [x] 4.10 Call contextBridge.exposeInMainWorld('raykit', globals)

## 5. Auxiliary Preload Script (src/browser/preload-aux.ts)

- [x] 5.1 Implement validateIPC function (same as preload.ts)
- [x] 5.2 Create globals object with minimal ipcRenderer (send/invoke only, no on/once/removeListener)
- [x] 5.3 Add webFrame with setZoomLevel to globals
- [x] 5.4 Omit webUtils, process, context from globals
- [x] 5.5 Call contextBridge.exposeInMainWorld('raykit', globals)

## 6. Testing and Documentation

- [x] 6.1 Write README.md with usage examples for both preload scripts
- [x] 6.2 Document all window.raykit APIs with TypeScript examples
- [x] 6.3 Add migration guide for existing apps using direct Electron access
- [x] 6.4 Create example showing BrowserWindow preload configuration
- [x] 6.5 Add troubleshooting section for common issues (IPC prefix errors, config resolution failures)

## 7. Integration and Finalization

- [x] 7.1 Run pnpm lint:fix to ensure code style compliance
- [x] 7.2 Run pnpm check to verify TypeScript compilation
- [x] 7.3 Verify all exports are properly configured in package.json
- [x] 7.4 Test imports from other packages (e.g., import preload from '@raykit/sandbox/preload')
- [x] 7.5 Update root pnpm-workspace.yaml if needed
- [x] 7.6 Run root pnpm i to ensure all dependencies are installed
