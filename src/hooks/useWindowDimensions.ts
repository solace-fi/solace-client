import { useState, useEffect } from 'react'
import { BKPT_5 } from '../constants'
import { WindowDimensions } from '../constants/types'

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height,
  }
}

export const useWindowDimensions = (): WindowDimensions => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  const { width } = windowDimensions
  const isDesktop = width > BKPT_5
  const isMobile = !isDesktop
  const ifDesktop = function <T, V>(desktopArg: T, mobileArg?: V): T | V | undefined {
    return isMobile ? mobileArg : desktopArg
  }
  const ifMobile = function <T, V>(mobileArg: T, desktopArg?: V): T | V | undefined {
    return isDesktop ? desktopArg : mobileArg
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...windowDimensions,
    isDesktop,
    isMobile,
    ifDesktop,
    ifMobile,
  }
}
