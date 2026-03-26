export const IActionsBar = Symbol('IActionsBar')
export interface IActionsBar {
  setBackgroundColor: (color?: string) => Promise<void>
}
