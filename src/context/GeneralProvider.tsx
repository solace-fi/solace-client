import React, { createContext, useContext, useState, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from '../styles/themes'
import { Error, SystemNotice } from '../constants/enums'
import { ErrorData, SystemNoticeData } from '../constants/types'

type GeneralContextType = {
  appTheme: 'light' | 'dark'
  toggleTheme: () => void
  notices: string[]
  errors: string[]
  addNotices: (noticesToAdd: SystemNoticeData[]) => void
  removeNotices: (noticesToRemove: SystemNotice[]) => void
  addErrors: (errorsToAdd: ErrorData[]) => void
  removeErrors: (errorsToRemove: Error[]) => void
}

const GeneralContext = createContext<GeneralContextType>({
  appTheme: 'light',
  toggleTheme: () => undefined,
  notices: [],
  errors: [],
  addNotices: () => undefined,
  removeNotices: () => undefined,
  addErrors: () => undefined,
  removeErrors: () => undefined,
})

export function useGeneral(): GeneralContextType {
  return useContext<GeneralContextType>(GeneralContext)
}

const GeneralProvider: React.FC = (props) => {
  const [selectedTheme, setSelectedTheme, removeSelectedTheme] = useLocalStorage<'light' | 'dark' | undefined>(
    'sol_data_theme'
  )
  const appTheme: 'light' | 'dark' = selectedTheme ?? 'light'
  const theme = appTheme == 'light' ? lightTheme : darkTheme
  const [notices, setNotices] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

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

  function toggleTheme() {
    if (appTheme === 'light') {
      setSelectedTheme('dark')
    } else if (appTheme === 'dark') {
      removeSelectedTheme()
    }
  }

  const value: GeneralContextType = {
    appTheme,
    toggleTheme,
    notices,
    errors,
    addNotices,
    removeNotices,
    addErrors,
    removeErrors,
  }

  return (
    <GeneralContext.Provider value={value}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </GeneralContext.Provider>
  )
}

export default GeneralProvider
