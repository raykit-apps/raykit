import type { IFrame } from '../common'

export interface RectangleLike {
  x: number
  y: number
  width: number
  height: number
}

export interface DisplayLike {
  bounds: RectangleLike
  workArea: RectangleLike
}

export function validateWindowBounds(bounds: Partial<IFrame>, displays: readonly DisplayLike[]): IFrame | undefined {
  if (
    typeof bounds.x !== 'number'
    || typeof bounds.y !== 'number'
    || typeof bounds.width !== 'number'
    || typeof bounds.height !== 'number'
  ) {
    return undefined
  }

  if (bounds.width <= 0 || bounds.height <= 0) {
    return undefined
  }

  if (displays.length === 0) {
    return bounds as IFrame
  }

  const workingAreas = displays
    .map(display => getWorkingArea(display))
    .filter((area): area is RectangleLike => area !== undefined)

  if (workingAreas.length === 0) {
    return bounds as IFrame
  }

  if (workingAreas.length === 1) {
    return clampWindowToArea(bounds as IFrame, workingAreas[0])
  }

  const matchingArea = workingAreas.find(area => intersects(bounds as IFrame, area))
  if (!matchingArea) {
    return undefined
  }

  return bounds as IFrame
}

function clampWindowToArea(bounds: IFrame, area: RectangleLike): IFrame {
  const width = Math.min(bounds.width, area.width)
  const height = Math.min(bounds.height, area.height)
  const maxX = area.x + area.width - Math.min(width, 128)
  const maxY = area.y + area.height - Math.min(height, 128)

  return {
    width,
    height,
    x: clamp(bounds.x, area.x, maxX),
    y: clamp(bounds.y, area.y, maxY),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function intersects(bounds: IFrame, area: RectangleLike): boolean {
  return (
    bounds.x + bounds.width > area.x
    && bounds.y + bounds.height > area.y
    && bounds.x < area.x + area.width
    && bounds.y < area.y + area.height
  )
}

function getWorkingArea(display: DisplayLike): RectangleLike | undefined {
  if (display.workArea.width > 0 && display.workArea.height > 0) {
    return display.workArea
  }

  if (display.bounds.width > 0 && display.bounds.height > 0) {
    return display.bounds
  }

  return undefined
}
