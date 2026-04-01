import { ApplicationBrowser, applicationBrowserModule } from '@raykit/core/browser'
import { Container } from 'inversify'
import { loadAutoBrowserModules } from 'virtual:raykit/auto-browser-modules'
import 'reflect-metadata'

import './index.css'

function load(container: Container) {
  loadAutoBrowserModules(container)
}

(async () => {
  const container = new Container()

  container.load(applicationBrowserModule)

  function start() {
    return container.get(ApplicationBrowser).start()
  }

  try {
    load(container)
    await start()
  } catch (error) {
    console.error('Failed to start the frontend application.')
    if (error) {
      console.error(error)
    }
  }
})()
