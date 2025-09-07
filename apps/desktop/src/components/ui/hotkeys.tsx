import { cn } from '@/lib/utils'

interface HotkeysProps extends React.ComponentPropsWithRef<'div'> {
  keys: string
}

function Hotkeys({ keys, className, ...props }: HotkeysProps) {
  return (
    <div className={cn('flex gap-[2px]', className)} {...props}>
      {keys.split('+').map(key => (
        <kbd key={key} className="h-5 flex items-center px-2 text-xs/[10px] rounded font-semibold bg-slate-100">
          {key}
        </kbd>
      ))}
    </div>
  )
}

export type { HotkeysProps }
export { Hotkeys }
