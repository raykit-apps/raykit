import { ApplicationMain, applicationMainModule } from '@raykit/core'
import { app } from 'electron'
import started from 'electron-squirrel-startup'
import { Container } from 'inversify'
import { loadAutoMainModules } from 'virtual:raykit/auto-main-modules'
import 'reflect-metadata'

(async () => {
  if (started || !app.requestSingleInstanceLock()) {
    app.quit()
  }

  const container = new Container()
  container.load(applicationMainModule)

  function load() {
    loadAutoMainModules(container)
  }

  async function start() {
    const application = container.get(ApplicationMain)
    await application.start()
  }

  try {
    load()
    await start()
  } catch (error) {
    if (typeof error !== 'number') {
      console.error('Failed to start the electron application.')
      if (error) {
        console.error(error)
      }
    }
    app.quit()
  }
})()
