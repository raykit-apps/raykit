import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Raykit',
    asar: true,
    extraResource: ['./resources/icons', './resources/app'],
    icon: './resources/icons/icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ setupIcon: './resources/icons/icon.ico' }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({ options: { icon: './resources/icons/icon.png' } }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: './build-configs/vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/node/preload.ts',
          config: './build-configs/vite.preload.config.ts',
          target: 'preload',
        },
        // {
        //   entry: 'src/electron/services.ts',
        //   config: './build-configs/vite.services.config.ts',
        // },
      ],
      renderer: [
        {
          name: 'main_window',
          config: './build-configs/vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
