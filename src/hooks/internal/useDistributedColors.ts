import { useState, useEffect } from 'react'
import { useGeneral } from '../../context/GeneralManager'

export const useDistributedColors = (maxItems: number): string[] => {
  const { appTheme } = useGeneral()
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    const getColors = (totalItems: number) => {
      // rgb settings: since we only want red to green colors, only values r and g will be adjusted
      const luminosityPercentage = appTheme == 'light' ? 0.7 : 1
      const rangeMin = appTheme == 'light' ? 60 : 133
      const rangeMax = appTheme == 'light' ? 255 : 255

      // b value appears to represent color intensity in this case, so it is set to rangeMin
      // the lower b is, the stronger the color
      let b = rangeMin
      let r = rangeMax
      let g = b

      const _colors = []

      const orderOfSpectrum = ['gu', 'rd', 'bu', 'gd', 'ru', 'bd']
      let spectrumIndex = 0

      // we do not need increment if the max tier is 0 or 1
      const increment =
        totalItems > 1
          ? ((rangeMax - rangeMin) * orderOfSpectrum.length) / (totalItems - 1)
          : (rangeMax - rangeMin) * orderOfSpectrum.length

      for (let i = 0; i < totalItems; i++) {
        // for easier index-to-color access, we are pushing values toward the beginning of the array
        _colors.unshift(`rgb(${r * luminosityPercentage}, ${g * luminosityPercentage}, ${b * luminosityPercentage})`)
        switch (orderOfSpectrum[spectrumIndex]) {
          case 'gu':
            if (g + increment >= rangeMax) {
              const leftOver = g + increment - rangeMax
              g = rangeMax
              r -= leftOver
              spectrumIndex++
            } else {
              g += increment
            }
            break
          case 'rd':
            if (r - increment <= rangeMin) {
              const leftOver = rangeMin - r - increment
              r = rangeMin
              b += leftOver
              spectrumIndex++
            } else {
              r -= increment
            }
            break
          case 'bu':
            if (b + increment >= rangeMax) {
              const leftOver = b + increment - rangeMax
              b = rangeMax
              g -= leftOver
              spectrumIndex++
            } else {
              b += increment
            }
            break
          case 'gd':
            if (g - increment <= rangeMin) {
              const leftOver = rangeMin - g - increment
              g = rangeMin
              r += leftOver
              spectrumIndex++
            } else {
              g -= increment
            }
            break
          case 'ru':
            if (r + increment >= rangeMax) {
              const leftOver = r + increment - rangeMax
              r = rangeMax
              b -= leftOver
              spectrumIndex++
            } else {
              r += increment
            }
            break
          case 'bd':
            if (b - increment <= rangeMin) {
              b = rangeMin
            } else {
              b -= increment
            }
            break
        }
      }
      setColors(_colors)
    }
    getColors(maxItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appTheme, maxItems])

  return colors
}
