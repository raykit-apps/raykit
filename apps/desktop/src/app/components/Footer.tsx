'use client'

import { cn } from '@/lib/utils'

// React.HTMLAttributes<HTMLDivElement>
export function Footer({ className }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('h-10 border-t px-3 flex justify-between', className)}>
      <div></div>
      <div></div>
    </div>
  )
}
