'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CustomCommandProps extends React.ComponentPropsWithRef<'div'> {

}

function CustomCommand({ className, children, ...props }: CustomCommandProps) {
  return <div className={cn('bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden', className)} {...props}>{children}</div>
}

interface CustomCommandInputProps extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {

}

function CustomCommandInput({ className, ...props }: CustomCommandInputProps) {
  return (
    <div className={cn('h-14 w-full flex flex-row items-center border-b px-4 text-base', className)} {...props}>
      {/* <div className="focus:outline-none custom-edit-hide-scroll flex-1 overflow-x-scroll whitespace-nowrap" contentEditable role='textbox' ></div> */}
      <div></div>
      <div></div>
    </div>
  )
}

function CustomCommandList() {
  return <></>
}

function CustomCommandEmpty() {
  return <></>
}

function CustomCommandGroup() {
  return <></>
}

export { CustomCommand, CustomCommandEmpty, CustomCommandGroup, CustomCommandInput, CustomCommandList }
