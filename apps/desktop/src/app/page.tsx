'use client'

import type { Commands } from '@/app/components/command-panel'
import * as React from 'react'
import { CommandFooter } from '@/app/components/command-footer'
import { CommandPanel, CommandPanelEmpty, CommandPanelGroups, CommandPanelInput, CommandPanelList } from '@/app/components/command-panel'

const commands: Commands[] = [
  {
    command: 'raykit',
    title: 'Raykit',
    subtitle: 'Raykit',
    type: 'Command',
  },
  {
    command: 'raykit-store',
    title: 'Raykit Store',
    subtitle: 'Raykit Store',
    type: 'Command',
  },
  {
    command: 'raykit-store-1',
    title: 'Raykit Store-1',
    subtitle: 'Raykit Store-1',
    type: 'Command',
  },
  {
    command: 'raykit-store-2',
    title: 'Raykit Store-2',
    subtitle: 'Raykit Store-2',
    type: 'Command',
  },
  {
    command: 'raykit-store-3',
    title: 'Raykit Store-3',
    subtitle: 'Raykit Store-3',
    type: 'Command',
  },
  {
    command: 'raykit-store-4',
    title: 'Raykit Store-4',
    subtitle: 'Raykit Store-4',
    type: 'Command',
  },
  {
    command: 'raykit-store-5',
    title: 'Raykit Store-5',
    subtitle: 'Raykit Store-5',
    type: 'Command',
  },
]

export default function Raykit() {
  return (
    <div className="size-full flex flex-col">
      <CommandPanel className="flex-1">
        <CommandPanelInput />
        <CommandPanelList>
          <CommandPanelEmpty>No results found.</CommandPanelEmpty>
          <CommandPanelGroups heading="Suggestions" commands={commands} />
        </CommandPanelList>
      </CommandPanel>
      <CommandFooter />
    </div>
  )
}
