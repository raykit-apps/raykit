import * as z from 'zod'

export const ThemeManifest = z.object({
  name: z.string(),
  type: z.union([z.literal('light'), z.literal('dark')]),
  colors: z.object({
    // global
    'background': z.string().optional(),
    'primary': z.string().optional(),
    'backdrop': z.string().optional(),
    'border': z.string().optional(),
    // search
    'search.background': z.string().optional(),
    'search.border': z.string().optional(),
    'search.foreground': z.string().optional(),
    'search.placeholderForeground': z.string().optional(),
    'searchBackButton.background': z.string().optional(),
    'searchBackButton.foreground': z.string().optional(),
    // commands
    'commands.background': z.string().optional(),
    'commandsHeading.foreground': z.string().optional(),
    'command.hoverBackground': z.string().optional(),
    'command.hoverShadow': z.string().optional(),
    'command.activeBackground': z.string().optional(),
    'command.activeShadow': z.string().optional(),
    'commandTitle.foreground': z.string().optional(),
    'commandSubtitle.foreground': z.string().optional(),
    'commandType.foreground': z.string().optional(),
    // kbd
    'kdb.background': z.string().optional(),
    'kdb.foreground': z.string().optional(),
    // actions
    'actionsBar.background': z.string().optional(),
    'actionsBar.border': z.string().optional(),
    'actionsButton.background': z.string().optional(),
    'actionsButton.foreground': z.string().optional(),
    'actionsButton.hoverBackground': z.string().optional(),
    'actionsButton.activeBackground': z.string().optional(),
    'actionsPanel.background': z.string().optional(),
    'actionsPanel.backdrop': z.string().optional(),
    'actionsPanel.shadow': z.string().optional(),
    // notifications
    'notifications.background': z.string().optional(),
    'notifications.foreground': z.string().optional(),
  }),
  tokenColors: z.object({
    'background': z.string().optional(),
    'foreground': z.string().optional(),
    'border': z.string().optional(),
    'button.hoverBackground': z.string().optional(),
    'button.activeBackground': z.string().optional(),
  }),
})
