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
  window.addEventListener('wheel', (e) =>
    e.deltaY < 0 ? setTimeout(onUp, 100) : e.deltaY > 0 && setTimeout(onDown, 100)
  )
  // detect arrow keys
  window.addEventListener('keydown', (e) => {
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
  })
  return {
    removeListeners: () => {
      window.removeEventListener('wheel', () => undefined)
      window.removeEventListener('keydown', () => undefined)
    },
  }
}
