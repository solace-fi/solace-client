import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from '../styles/themes'
import { Error, SystemNotice } from '../constants/enums'
import { ErrorData, SystemNoticeData } from '../constants/types'

import { LinksModal } from '../components/organisms/LinksModal'
import { useWindowDimensions } from '../hooks/useWindowDimensions'
import { MAX_MOBILE_SCREEN_WIDTH } from '../constants'

type GeneralContextType = {
  appTheme: 'light' | 'dark'
  selectedTheme: 'light' | 'dark' | undefined
  toggleTheme: () => void
  notices: string[]
  errors: string[]
  addNotices: (noticesToAdd: SystemNoticeData[]) => void
  removeNotices: (noticesToRemove: SystemNotice[]) => void
  addErrors: (errorsToAdd: ErrorData[]) => void
  removeErrors: (errorsToRemove: Error[]) => void
  openModal: () => void
}

const GeneralContext = createContext<GeneralContextType>({
  appTheme: 'light',
  selectedTheme: undefined,
  toggleTheme: () => undefined,
  notices: [],
  errors: [],
  addNotices: () => undefined,
  removeNotices: () => undefined,
  addErrors: () => undefined,
  removeErrors: () => undefined,
  openModal: () => undefined,
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
  const [notices, setNotices] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const { width } = useWindowDimensions()
  const [showLinksModal, setShowLinksModal] = useState<boolean>(false)

  const openModal = useCallback(() => {
    setShowLinksModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowLinksModal(false)
  }, [])

  const addNotices = useCallback((noticesToAdd: SystemNoticeData[]) => {
    if (noticesToAdd.length == 0) return

    // convert input data into JSON string array
    const stringifiedNoticeData = noticesToAdd.map((notice) => JSON.stringify(notice))

    setNotices([...stringifiedNoticeData, ...notices])
  }, [])

  const removeNotices = useCallback((noticesToRemove: SystemNotice[]) => {
    if (noticesToRemove.length == 0) return

    // convert cached data into JSON object to compare types, then remove those from cache whose types match
    const updatedNotices = notices.filter(
      (notice: string) => !noticesToRemove.includes((JSON.parse(notice) as SystemNoticeData).type)
    )
    if (updatedNotices == notices) return
    setNotices(updatedNotices)
  }, [])

  const addErrors = useCallback((errorsToAdd: ErrorData[]) => {
    if (errorsToAdd.length == 0) return

    // convert input data into JSON string array
    const stringifiedErrorData = errorsToAdd.map((error) => JSON.stringify(error))

    setErrors([...stringifiedErrorData, ...errors])
  }, [])

  const removeErrors = useCallback((errorsToRemove: Error[]) => {
    if (errorsToRemove.length == 0) return

    // convert cached data into JSON object to compare types, then remove those from cache whose types match
    const updatedErrors = errors.filter(
      (error: string) => !errorsToRemove.includes((JSON.parse(error) as ErrorData).type)
    )
    if (updatedErrors == notices) return
    setErrors(updatedErrors)
  }, [])

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
    notices,
    errors,
    addNotices,
    removeNotices,
    addErrors,
    removeErrors,
    openModal,
  }

  return (
    <GeneralContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <LinksModal isOpen={showLinksModal && width <= MAX_MOBILE_SCREEN_WIDTH} closeModal={() => closeModal()} />
        {props.children}
      </ThemeProvider>
    </GeneralContext.Provider>
  )
}

export default GeneralProvider
