import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useStorage } from '../hooks/useStorage'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from '../styles/themes'
import { Error, SystemNotice } from '../constants/enums'
import { ErrorData, SystemNoticeData } from '../constants/types'

/*

This manager stored any data that should be made available 
not just to all parts of the app, but for all the other Managers as well.

*/

type GeneralContextType = {
  appTheme: 'light' | 'dark'
  toggleTheme: () => void
  notices: string[]
  errors: string[]
  haveErrors: boolean
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
  haveErrors: false,
  addNotices: () => undefined,
  removeNotices: () => undefined,
  addErrors: () => undefined,
  removeErrors: () => undefined,
})

export function useGeneral(): GeneralContextType {
  return useContext<GeneralContextType>(GeneralContext)
}

const GeneralProvider: React.FC = (props) => {
  const [selectedTheme, setSelectedTheme, removeSelectedTheme] = useStorage<'light' | 'dark' | undefined>(
    'local',
    'sol_data_theme',
    null
  )
  const appTheme: 'light' | 'dark' = selectedTheme ?? 'light'
  const theme = appTheme == 'light' ? lightTheme : darkTheme
  const [notices, setNotices] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const haveErrors = useRef(errors.length > 0)

  const addNotices = useCallback(
    (noticesToAdd: SystemNoticeData[]) => {
      if (noticesToAdd.length == 0) return

      // convert input data into JSON string array
      const stringifiedNoticeData = noticesToAdd.map((notice) => JSON.stringify(notice))

      setNotices([...stringifiedNoticeData, ...notices])
    },
    [notices]
  )

  const removeNotices = useCallback(
    (noticesToRemove: SystemNotice[]) => {
      if (noticesToRemove.length == 0) return

      // convert cached data into JSON object to compare types, then remove those from cache whose types match
      const updatedNotices = notices.filter(
        (notice: string) => !noticesToRemove.includes((JSON.parse(notice) as SystemNoticeData).type)
      )
      if (updatedNotices == notices) return
      setNotices(updatedNotices)
    },
    [notices]
  )

  const addErrors = useCallback(
    (errorsToAdd: ErrorData[]) => {
      if (errorsToAdd.length == 0) return

      // convert input data into JSON string array
      const stringifiedErrorData = errorsToAdd.map((error) => JSON.stringify(error))

      setErrors([...stringifiedErrorData, ...errors])
    },
    [errors]
  )

  const removeErrors = useCallback(
    (errorsToRemove: Error[]) => {
      if (errorsToRemove.length == 0) return

      // convert cached data into JSON object to compare types, then remove those from cache whose types match
      const updatedErrors = errors.filter(
        (error: string) => !errorsToRemove.includes((JSON.parse(error) as ErrorData).type)
      )
      if (updatedErrors == notices) return
      setErrors(updatedErrors)
    },
    [errors, notices]
  )

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
    haveErrors: haveErrors.current,
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
