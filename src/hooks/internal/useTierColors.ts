import { useState, useEffect } from 'react'
import { useGeneral } from '../../context/GeneralManager'

export const useTierColors = (): string[] => {
  const { appTheme } = useGeneral()
  const [tierColors, setTierColors] = useState<string[]>([])

  useEffect(() => {
    const getGreenToRedColors = (totalTiers: number) => {
      // rgb settings: since we only want red to green colors, only values r and g will be adjusted
      const luminosityPercentage = appTheme == 'light' ? 0.7 : 0.8
      const rangeMin = appTheme == 'light' ? 60 : 80
      const rangeMax = 255

      // b value appears to represent color intensity in this case, so it is set to rangeMin
      // the lower b is, the stronger the color
      const b = rangeMin
      let r = rangeMax
      let g = b

      const colors = []

      // since we are changing r and g, we are changing two color ranges of equal length,
      // then divide the product by the number of tiers to get the increment
      // we do not need increment if the max tier is 0 or 1
      const increment = totalTiers > 1 ? ((rangeMax - rangeMin) * 2) / (totalTiers - 1) : (rangeMax - rangeMin) * 2

      // we start by changing the g value to get the green colors first
      let changingR = false
      for (let i = 0; i < totalTiers; i++) {
        // for easier index-to-color access, we are pushing values toward the beginning of the array
        // the lower the index, the greener the color, and the higher the index, the redder the color
        colors.unshift(`rgb(${r * luminosityPercentage}, ${g * luminosityPercentage}, ${b * luminosityPercentage})`)
        if (changingR) {
          r -= increment
        } else {
          // if g goes past the max range, pour that leftover increment into subtracting from r
          if (g + increment > rangeMax) {
            const leftOver = g + increment - rangeMax
            g = rangeMax
            r -= leftOver
            changingR = true
          } else {
            g += increment
          }
          // switch to change r value if we got all the g colors
          if (g == rangeMax) {
            changingR = true
          }
        }
      }
      setTierColors(colors)
    }
    getGreenToRedColors(5) // [1, 2, 3, 4, 0] or [A, B, C, D, F]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appTheme])

  return tierColors
}
