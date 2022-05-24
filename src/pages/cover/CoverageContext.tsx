import { SolaceRiskSeries } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR } from '../../constants'
import { InterfaceState } from '../../constants/enums'
import { SolaceRiskBalance, SolaceRiskScore } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { usePortfolio, useRiskSeries } from '../../hooks/policy/useSolaceCoverProduct'

type CoverageContextType = {
  intrface: {
    navbarThreshold: boolean
    showPortfolio: boolean
    setShowPortfolio: (show: boolean) => void
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
    gradientStyle: any
  }
  portfolioKit: {
    portfolio?: SolaceRiskScore
    loading: boolean
    riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
  }
  seriesKit: {
    series?: SolaceRiskSeries
    seriesLogos: { label: string; value: string; icon: JSX.Element }[]
  }
}

const CoverageContext = createContext<CoverageContextType>({
  intrface: {
    navbarThreshold: false,
    showPortfolio: false,
    setShowPortfolio: () => undefined,
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
    gradientStyle: {},
  },
  portfolioKit: {
    portfolio: undefined,
    loading: true,
    riskScores: () => Promise.reject(),
  },
  seriesKit: {
    series: undefined,
    seriesLogos: [],
  },
})

const CoverageManager: React.FC = (props) => {
  const { account } = useWeb3React()
  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { portfolio, riskScores, loading: portfolioLoading } = usePortfolio(account, [1, 137], false)
  const { series, loading: seriesLoading } = useRiskSeries()
  const navbarThreshold = useMemo(() => width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR), [rightSidebar, width])
  const [enteredDays, setEnteredDays] = useState<string | undefined>(undefined)
  const [enteredAmount, setEnteredAmount] = useState<string | undefined>(undefined)
  const [userState, setUserState] = useState<InterfaceState>(InterfaceState.BUYING)
  const [loading, setLoading] = useState(false)
  const [interfaceState, setInterfaceState] = useState<InterfaceState>(loading ? InterfaceState.LOADING : userState)
  const [showPortfolio, setShowPortfolio] = useState(false)

  const seriesLogos = useMemo(
    () =>
      series
        ? series.data.protocolMap.map((s) => {
            return {
              label: s.appId,
              value: s.appId,
              icon: <img src={`https://assets.solace.fi/zapperLogos/${s.appId}`} height={24} />,
            }
          })
        : [],
    [series]
  )

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

  const gradientStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )

  useEffect(() => {
    setLoading(portfolioLoading || seriesLoading)
  }, [portfolioLoading, seriesLoading])

  const value = useMemo<CoverageContextType>(
    () => ({
      navbarThreshold,
      intrface: {
        navbarThreshold,
        showPortfolio,
        setShowPortfolio,
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
        gradientStyle,
      },
      portfolioKit: {
        portfolio,
        loading: portfolioLoading,
        riskScores,
      },
      seriesKit: {
        series,
        seriesLogos,
      },
    }),
    [
      navbarThreshold,
      daysOpen,
      coinsOpen,
      enteredDays,
      enteredAmount,
      daysOptions,
      coinOptions,
      bigButtonStyle,
      gradientStyle,
      interfaceState,
      portfolio,
      portfolioLoading,
      series,
      seriesLogos,
      showPortfolio,
      riskScores,
      // setEnteredDays,
      // setEnteredAmount,
      // setDaysOpen,
      // setCoinsOpen,
      // setInterfaceState,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
