import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from '../styles/themes'

type GeneralContextType = {
  appTheme: 'light' | 'dark'
  selectedTheme: 'light' | 'dark' | undefined
  toggleTheme: () => void
}

const GeneralContext = createContext<GeneralContextType>({
  appTheme: 'light',
  selectedTheme: undefined,
  toggleTheme: () => undefined,
})

const mqlDark = window.matchMedia('(prefers-color-scheme: dark)')
const defaultTheme = mqlDark.matches ? 'dark' : 'light'

export function useGeneral(): GeneralContextType {
  return useContext<GeneralContextType>(GeneralContext)
}

const GeneralProvider: React.FC = (props) => {
  const [osColorScheme, setOsColorScheme] = useState<'light' | 'dark'>(defaultTheme)
  const [selectedTheme, setSelectedTheme, removeSelectedTheme] = useLocalStorage<'light' | 'dark' | undefined>(
    'sol_data_theme'
  )

  const appTheme: 'light' | 'dark' = selectedTheme || osColorScheme

  const theme = appTheme == 'light' ? lightTheme : darkTheme

  useEffect(() => {
    setOsColorScheme(defaultTheme)

    mqlDark.addEventListener('change', (e) => {
      setOsColorScheme(e.matches ? 'dark' : 'light')
    })
  }, [])

  function toggleTheme() {
    if (selectedTheme === 'light') {
      setSelectedTheme('dark')
    } else if (selectedTheme === 'dark') {
      removeSelectedTheme()
    } else {
      setSelectedTheme('light')
    }
  }

  const value: GeneralContextType = {
    appTheme,
    selectedTheme,
    toggleTheme,
  }

  return (
    <GeneralContext.Provider value={value}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </GeneralContext.Provider>
  )
}

export default GeneralProvider
