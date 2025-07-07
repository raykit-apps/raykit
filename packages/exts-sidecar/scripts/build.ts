import { execSync } from 'node:child_process'

async function build() {
  execSync('node --experimental-sea-config sea-config.json')
}

build()
