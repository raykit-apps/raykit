import {} from 'svelte/store'

export interface AppState {
  heading: {
    showBlackBtn: boolean
    select?: {
      default: string
      options: { value: string, label: string }[]
    }
    search: string
  }
  footer: {
    actionPanel: { value: string, label: string }[]
    extension?: {
      icon: string
      displayName: string
      action: string
    }
  }
}

export const defaultAppState: AppState = {
  heading: {
    showBlackBtn: false,
    search: '',
  },
  footer: {
    actionPanel: [],
  },
}

function createAppState() {

}

export const appState = createAppState()
