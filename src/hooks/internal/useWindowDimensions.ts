import { useState, useEffect } from 'react'
import { BKPT_5, BKPT_6 } from '../../constants'
import { WindowDimensions } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height,
  }
}

export const useWindowDimensions = (): WindowDimensions => {
  const { rightSidebar } = useGeneral()
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  const [scrollPosition, setScrollPosition] = useState(0)

  const { width } = windowDimensions
  const isDesktop = width > (rightSidebar ? BKPT_6 : BKPT_5)
  const isMobile = !isDesktop
  const ifDesktop = function <T, V>(desktopArg: T, mobileArg?: V): T | V | undefined {
    return isMobile ? mobileArg : desktopArg
  }
  const ifMobile = function <T, V>(mobileArg: T, desktopArg?: V): T | V | undefined {
    return isDesktop ? desktopArg : mobileArg
  }

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset
      setScrollPosition(position)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...windowDimensions,
    scrollPosition,
    isDesktop,
    isMobile,
    ifDesktop,
    ifMobile,
  }
}
