import type { JSX } from 'solid-js/jsx-runtime'
import { SolidWidget } from '@raykit/widgets'
import { injectable, postConstruct } from 'inversify'
import { onCleanup, onMount } from 'solid-js'

@injectable()
export class QuickSearchWidget extends SolidWidget {
  public static readonly ID = 'quick-search-widget'

  public static readonly LABEL = 'Quick Search'

  @postConstruct()
  protected init(): void {
    this.doInit()
  }

  protected doInit(): void {
    this.id = QuickSearchWidget.ID
    this.title.label = QuickSearchWidget.LABEL
  }

  protected render(): JSX.Element {
    let inputRef!: HTMLInputElement

    const focusInput = (): void => {
      inputRef.focus({ preventScroll: true })
    }

    onMount(() => {
      focusInput()
      window.addEventListener('focus', focusInput)
    })

    onCleanup(() => {
      window.removeEventListener('focus', focusInput)
    })

    return (
      <header class="h-14 flex items-center px-4 border-b border-accent">
        <div class="flex-1 w-0 flex">
          <input
            ref={inputRef}
            class="flex-auto appearance-none border-0 bg-transparent outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
            autocomplete="off"
            autocorrect="off"
            type="text"
          />
        </div>
      </header>
    )
  }
}
