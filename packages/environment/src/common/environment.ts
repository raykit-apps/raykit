export interface IEnvironmentService {
  readonly _serviceBrand: undefined

  // --- data paths
  appRootDir: string
  userDir: string
  appSettingsDir: string
  tmpDir: string
  userDataDir: string

  // --- extensions
  extensionDir: string

  // --- extension development

  // --- logging
  logsDir: string
  logsFile: string
  logLevel?: string
  extensionLogLevel?: [string, string][]
}
