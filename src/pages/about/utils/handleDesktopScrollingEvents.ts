// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleDesktopScrollingEvents({
  onUp,
  onDown,
  onEnd,
  onHome,
}: {
  onUp: () => void
  onDown: () => void
  onEnd: () => void
  onHome: () => void
}) {
  // detect scrolling
  const wheelHandler = (e: WheelEvent) =>
    e.deltaY < 0 ? setTimeout(onUp, 100) : e.deltaY > 0 && setTimeout(onDown, 100)

  // detect arrow keys
  const keyDownHandler = (e: KeyboardEvent) => {
    // up arrow or page up
    if (e.code === 'ArrowUp' || e.code === 'PageUp') {
      onUp()
    }
    // down arrow, page down, or space
    if (e.code === 'ArrowDown' || e.code === 'PageDown' || e.code === 'Space') {
      onDown()
    }
    // start or end
    if (e.code === 'Home') {
      onHome()
    }
    if (e.code === 'End') {
      onEnd()
    }
  }

  window.addEventListener('wheel', wheelHandler)
  window.addEventListener('keydown', keyDownHandler)
  return {
    removeListeners: () => {
      window.removeEventListener('wheel', () => wheelHandler)
      window.removeEventListener('keydown', () => keyDownHandler)
    },
  }
}
