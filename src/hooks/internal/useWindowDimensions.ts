import { useState, useEffect } from 'react'
import { BKPT_3, BKPT_4, BKPT_5, BKPT_7 } from '../../constants'
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

  const { width } = windowDimensions
  const isDesktop = width > (rightSidebar ? BKPT_7 : BKPT_5)
  const isMobile = !isDesktop

  const isSmallerMobile = width <= (rightSidebar ? BKPT_4 : BKPT_3)

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
    isSmallerMobile,
    ifDesktop,
    ifMobile,
  }
}
