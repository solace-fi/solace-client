import React, { createContext, useContext, useMemo, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR } from '../../constants'
import { InterfaceState } from '../../constants/enums'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

type CoverageContextType = {
  intrface: {
    navbarThreshold: boolean
    interfaceState: InterfaceState
    setInterfaceState: (state: InterfaceState) => void
  }
  input: {
    enteredDays?: string
    enteredAmount?: string
    setEnteredDays: (value: string) => void
    setEnteredAmount: (value: string) => void
  }
  dropdowns: {
    daysOptions: { label: string; value: string }[]
    coinOptions: { label: string; value: string }[]
    daysOpen: boolean
    coinsOpen: boolean
    setDaysOpen: (value: boolean) => void
    setCoinsOpen: (value: boolean) => void
  }
  styles: {
    bigButtonStyle: any
    gradientTextStyle: any
  }
}

const CoverageContext = createContext<CoverageContextType>({
  intrface: {
    navbarThreshold: false,
    interfaceState: InterfaceState.LOADING,
    setInterfaceState: () => undefined,
  },
  input: {
    enteredDays: undefined,
    enteredAmount: undefined,
    setEnteredDays: () => undefined,
    setEnteredAmount: () => undefined,
  },
  dropdowns: {
    daysOptions: [],
    coinOptions: [],
    daysOpen: false,
    coinsOpen: false,
    setDaysOpen: () => undefined,
    setCoinsOpen: () => undefined,
  },
  styles: {
    bigButtonStyle: {},
    gradientTextStyle: {},
  },
})

const CoverageManager: React.FC = (props) => {
  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const navbarThreshold = useMemo(() => width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR), [rightSidebar, width])
  const [enteredDays, setEnteredDays] = useState<string | undefined>(undefined)
  const [enteredAmount, setEnteredAmount] = useState<string | undefined>(undefined)
  const [interfaceState, setInterfaceState] = useState<InterfaceState>(InterfaceState.LOADING)

  const [daysOpen, setDaysOpen] = useState(false)
  const [coinsOpen, setCoinsOpen] = useState(false)

  const daysOptions = useMemo(
    () => [
      { label: '1 Week', value: '1' },
      { label: '2 Weeks', value: '2' },
      { label: '3 Weeks', value: '3' },
      { label: '1 Month', value: '4' },
      { label: '2 Months', value: '5' },
      { label: '4 Months', value: '16' },
    ],
    []
  )

  const coinOptions = useMemo(
    () => [
      { label: 'FRAX', value: '1' },
      { label: 'DAI', value: '2' },
      { label: 'USDC', value: '3' },
      { label: 'USDT', value: '4' },
      { label: 'UST', value: '5' },
      { label: 'CELO', value: '6' },
      { label: 'AAVE', value: '7' },
      { label: 'USTA', value: '8' },
      { label: 'CELOR', value: '9' },
    ],
    []
  )

  const bigButtonStyle = useMemo(() => {
    return {
      pt: 16,
      pb: 16,
      widthP: 100,
    }
  }, [])

  const gradientTextStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )

  const value = useMemo<CoverageContextType>(
    () => ({
      navbarThreshold,
      intrface: {
        navbarThreshold,
        interfaceState,
        setInterfaceState,
      },
      input: {
        enteredDays,
        enteredAmount,
        setEnteredDays,
        setEnteredAmount,
      },
      dropdowns: {
        daysOptions,
        coinOptions,
        daysOpen,
        coinsOpen,
        setDaysOpen,
        setCoinsOpen,
      },
      styles: {
        bigButtonStyle,
        gradientTextStyle,
      },
    }),
    [
      navbarThreshold,
      daysOpen,
      coinsOpen,
      enteredDays,
      enteredAmount,
      setEnteredDays,
      setEnteredAmount,
      setDaysOpen,
      setCoinsOpen,
      daysOptions,
      coinOptions,
      bigButtonStyle,
      gradientTextStyle,
      interfaceState,
      setInterfaceState,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
