'use client'

import { Command as CommandPrimitive } from 'cmdk'
import Image from 'next/image'
import * as React from 'react'
import { createEditor } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

function CommandPanel({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      shouldFilter={false}
      autoFocus
      className={cn(
        'bg-popover text-popover-foreground flex w-full flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

interface CommandPanelInputProps extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {

}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

function CommandPanelInput({ className, ...props }: CommandPanelInputProps) {
  const [editor] = React.useState(() => withReact(createEditor()))

  return (
    <div className={cn('h-14 w-full flex flex-row items-center border-b px-4', className)} {...props}>
      <div className="flex-1 w-0 whitespace-normal overflow-x-auto scroll-none">
        <Slate editor={editor} initialValue={initialValue}>
          <Editable
            className="outline-none whitespace-pre relative text-base"
            placeholder="Type a command or search..."
            disableDefaultStyles={true}
            // renderElement={renderElement}
            onPaste={(event) => {
              event.preventDefault()
              const text = event.clipboardData.getData('text/plain').replace(/[\r\n]/g, ' ')
              editor.insertText(text)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                editor.insertText(' ')
              }
            }}
          />
        </Slate>
      </div>
      <div></div>
    </div>
  )
}

function CommandPanelList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'flex-1 h-0 w-full [&_[cmdk-list-sizer]]:h-full',
        className,
      )}
      {...props}
    >
      <ScrollArea className="size-full px-2">
        {children}
      </ScrollArea>
    </CommandPrimitive.List>
  )
}

function CommandPanelEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

interface Commands {
  command: string
  icon?: string
  title: string
  subtitle: string
  type: string
}

interface CommandPanelGroupsProps extends Omit<React.ComponentProps<typeof CommandPrimitive.Group>, 'children'> {
  commands: Commands[]
}

function CommandPanelGroups({
  className,
  commands,
  ...props
}: CommandPanelGroupsProps) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:pb-2  [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold',
        className,
      )}
      {...props}
    >
      {commands.map(command => (
        <CommandPrimitive.Item
          key={command.command}
          value={command.command}
          data-slot="command-item"
          className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative h-10 flex cursor-default items-center gap-2.5 rounded-md px-2 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
        >
          <Image src={command.icon ?? '/icon.svg'} className="rounded-md" alt="logo" width={20} height={20} />
          <div className="flex-1 flex gap-2.5">
            <span>{command.title}</span>
            <span className="opacity-50">{command.subtitle}</span>
          </div>
          <span className="opacity-50">{command.type}</span>
        </CommandPrimitive.Item>
      ))}
    </CommandPrimitive.Group>
  )
}

export type { Commands }
export { CommandPanel, CommandPanelEmpty, CommandPanelGroups, CommandPanelInput, CommandPanelList }
