'use client'

import Image from 'next/image'
import { Hotkeys } from '@/components/ui/hotkeys'
import { cn } from '@/lib/utils'
import { Actions } from './actions'

// React.HTMLAttributes<HTMLDivElement>
function CustomFooter({ className }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('h-10 border-t px-3 flex justify-between', className)}>
      <div className="flex gap-2 items-center">
        <Image src="/icon.svg" alt="logo" width={20} height={20} />
        <span className="text-sm">Raykit</span>
      </div>
      <div className="flex gap-3 items-center">
        <CustomFooterButton>
          Enter
          <Hotkeys keys="↵" />
        </CustomFooterButton>
        <div className="w-px bg-slate-300 h-3"></div>
        <Actions />
      </div>
    </div>
  )
}

function CustomFooterButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      data-slot="button"
      className={cn('flex gap-2 py-1 pl-2 pr-1 text-sm rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50', className)}
      type="button"
      {...props}
    />
  )
}

export { CustomFooter, CustomFooterButton }
