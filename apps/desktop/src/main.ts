import { app, Menu, protocol } from 'electron'

const isSingleInstance = app.requestSingleInstanceLock()

if (!isSingleInstance) {
  app.quit()
  process.exit(1)
}

Menu.setApplicationMenu(null)

// Register custom schemes with privileges
protocol.registerSchemesAsPrivileged([
  { scheme: 'raykit-webview', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true, codeCache: true } },
  { scheme: 'raykit-file', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, codeCache: true } },
])

app.once('ready', () => {
  import('./mian/index.js')
})
