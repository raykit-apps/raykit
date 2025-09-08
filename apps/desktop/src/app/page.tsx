'use client'

import * as React from 'react'
import { CustomCommand, CustomCommandInput } from '@/app/components/custom-command'
import { CustomFooter } from '@/app/components/custom-footer'

export default function Raykit() {
  // const [search, setSearch] = React.useState('')
  // const inputRef = React.useRef<HTMLInputElement | null>(null)

  // React.useEffect(() => {
  //   inputRef?.current?.focus()
  // }, [])

  // const searchCommands = (v: string) => {
  //   setSearch(v)
  // }

  return (
    <div className="size-full flex flex-col">
      <CustomCommand className="flex-1">
        <CustomCommandInput />
      </CustomCommand>
      <CustomFooter />
    </div>
  )
}
