export const WindowMinSize = {
  width: 750,
  height: 475,
}

export interface IFrame {
  x: number
  y: number
  width: number
  height: number
}

export interface IOpenWindowOptions {
  forceReuseWindow?: boolean
  forceNewWindow?: boolean
  preferNewWindow?: boolean
}

export interface IOpenMainWindow {

}
