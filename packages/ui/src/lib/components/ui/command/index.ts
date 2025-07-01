import type { CommandGroupItem, CommandGroupOption, CommandGroupsProps } from './command-groups.svelte'

import { Command as CommandPrimitive } from 'bits-ui'
import Dialog from './command-dialog.svelte'
import Empty from './command-empty.svelte'
import Footer from './command-footer.svelte'
import Group from './command-group.svelte'
import Groups from './command-groups.svelte'
import Heading from './command-heading.svelte'
import Input from './command-input.svelte'
import Item from './command-item.svelte'
import LinkItem from './command-link-item.svelte'
import List from './command-list.svelte'
import Separator from './command-separator.svelte'
import Shortcut from './command-shortcut.svelte'
import Root from './command.svelte'

const Loading = CommandPrimitive.Loading

export type {
  CommandGroupItem,
  CommandGroupOption,
  CommandGroupsProps,
}

export {
  //
  Root as Command,
  Dialog as CommandDialog,
  Empty as CommandEmpty,
  Footer as CommandFooter,
  Group as CommandGroup,
  Groups as CommandGroups,
  Heading as CommandHeading,
  Input as CommandInput,
  Item as CommandItem,
  LinkItem as CommandLinkItem,
  List as CommandList,
  Loading as CommandLoading,
  Separator as CommandSeparator,
  Shortcut as CommandShortcut,
  Dialog,
  Empty,
  Footer,
  Group,
  Groups,
  Heading,
  Input,
  Item,
  LinkItem,
  List,
  Loading,
  Root,
  Separator,
  Shortcut,
}
