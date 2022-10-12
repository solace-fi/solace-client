import { useRef, useState, useEffect } from 'react'

export const useScrollPercentage = (): { scrollRef: React.RefObject<HTMLDivElement>; scrollPercentage: number } => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPercentage, setScrollPercentage] = useState(NaN)

  const reportScroll = (ev: Event) => {
    setScrollPercentage(getScrollPercentage(ev.target))
  }

  useEffect(() => {
    const node = scrollRef.current
    if (node !== null) {
      node.addEventListener('scroll', reportScroll, { passive: true })
      if (Number.isNaN(scrollPercentage)) {
        setScrollPercentage(getScrollPercentage(node))
      }
    }
    return () => {
      if (node !== null) {
        node.removeEventListener('scroll', reportScroll)
      }
    }
  }, [scrollPercentage])

  return { scrollRef, scrollPercentage: Number.isNaN(scrollPercentage) ? 0 : scrollPercentage }
}

function getScrollPercentage(element: any) {
  if (element === null) {
    return NaN
  }
  const height = element.scrollHeight - element.clientHeight
  return Math.round((element.scrollTop / height) * 100)
}
