import * as z from 'zod'

export const CommandsManifest = z.object({
  command: z.string(),
  title: z.string(),
  subtitle: z.optional(z.string()),
  description: z.string(),
  icon: z.optional(z.string()),
  keywords: z.optional(z.array(z.string())),
  when: z.optional(z.string()),
  mode: z.union([z.literal('view'), z.literal('no-view')]),
  disabledByDefault: z.optional(z.boolean()),
})

export const ViewsManifest = z.object({
  command: z.string(),
  x: z.optional(z.number()),
  y: z.optional(z.number()),
  width: z.optional(z.number()),
  height: z.optional(z.number()),
  minWidth: z.optional(z.number()),
  minHeight: z.optional(z.number()),
  maxWidth: z.optional(z.number()),
  maxHeight: z.optional(z.number()),
  resizable: z.optional(z.boolean()),
  title: z.optional(z.string()),
  fullscreen: z.optional(z.boolean()),
  focus: z.optional(z.boolean()),
})

export const ThemesManifest = z.object({})

export const KeybindingsManifest = z.object({})

export const ContributesManifest = z.object({
  commands: z.optional(z.array(CommandsManifest)),
  views: z.optional(z.array(ViewsManifest)),
  themes: z.optional(z.array(ThemesManifest)),
  keybindings: z.optional(z.array(KeybindingsManifest)),
})

export const License = z.union([
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
  publisher: z.string(),
  license: License,
  contributes: ContributesManifest,
})

export type ExtensionManifest = z.infer<typeof ExtensionManifest>
