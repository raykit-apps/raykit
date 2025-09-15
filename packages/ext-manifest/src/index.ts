import * as z from 'zod'

export const CommandsManifest = z.object({
  command: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  icon: z.string().optional(),
  description: z.string(),
  keywords: z.string().array().optional(),
  when: z.string().optional(),
  lens: z.number().array().optional(),
  disabledByDefault: z.boolean().default(false).optional(),
})

const PopupManifest = z.object({
  command: z.string(),
  mode: z.literal('popup'),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxHeight: z.number().optional(),
  resizable: z.boolean().optional(),
  title: z.string().optional(),
  fullscreen: z.boolean().optional(),
  focus: z.boolean().optional(),
})

const EmbedManifest = z.object({
  command: z.string(),
  mode: z.literal('embed'),
  detachable: z.boolean().default(false).optional(),
})

export const ViewsManifest = z.discriminatedUnion('mode', [PopupManifest, EmbedManifest])

export const ThemesManifest = z.object({})

export const KeybindingsManifest = z.object({})

export const ContributesManifest = z.object({
  commands: z.array(CommandsManifest).optional(),
  views: z.array(ViewsManifest).optional(),
  themes: z.array(ThemesManifest).optional(),
  keybindings: z.array(KeybindingsManifest).optional(),
})

export const LicenseManifest = z.union([
  z.literal('Apache-2.0'),
  z.literal('BSD-2-Clause'),
  z.literal('BSD-3-Clause'),
  z.literal('GPL-2.0-only'),
  z.literal('GPL-3.0-only'),
  z.literal('ISC'),
  z.literal('LGPL-2.0-only'),
  z.literal('LGPL-3.0-only'),
  z.literal('MIT'),
])

export const ExtensionManifest = z.object({
  name: z.string(),
  title: z.string(),
  version: z.string(),
  author: z.string(),
  description: z.string(),
  preview: z.boolean().default(false).optional(),
  main: z.string(),
  categories: z.string().array(),
  icon: z.string(),
  license: LicenseManifest,
  contributes: ContributesManifest,
  keywords: z.string().array().optional(),
  extensionPack: z.string().array().optional(),
  extensionDependencies: z.string().array().optional(),
  activation: z.enum(['startup', 'onCommand']),
})

export type ExtensionManifest = z.infer<typeof ExtensionManifest>
