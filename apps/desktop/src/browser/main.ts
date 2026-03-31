import { commandBrowserModule } from '@raykit/commands/browser'
import { ApplicationBrowser, applicationBrowserModule } from '@raykit/core/browser'
import { quickInputModule } from '@raykit/quick-input/browser'
import { Container } from 'inversify'
import 'reflect-metadata'

import './index.css'

function load(container: Container) {
  container.load(commandBrowserModule)
  container.load(quickInputModule)
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
