import { SolaceRiskSeries } from '@solace-fi/sdk-nightly'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR, ZERO } from '../../constants'
import { InterfaceState } from '../../constants/enums'
import { coinsMap } from '../../constants/mappings/token'
import { ReadToken, SolaceRiskBalance, SolaceRiskScore, TokenInfo } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'
import { useBatchBalances } from '../../hooks/balance/useBalance'
import { useInputAmount } from '../../hooks/internal/useInputAmount'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { usePortfolio, useRiskSeries, useCheckIsCoverageActive } from '../../hooks/policy/useSolaceCoverProductV3'
import { BigNumber } from 'ethers'
import { accurateMultiply } from '../../utils/formatting'

type CoverageContextType = {
  intrface: {
    navbarThreshold: boolean
    showPortfolio: boolean
    handleShowPortfolio: (show: boolean) => void
    interfaceState: InterfaceState
    userState: InterfaceState
    handleUserState: (state: InterfaceState) => void
    portfolioLoading: boolean
    seriesLoading: boolean
    balancesLoading: boolean
    coverageLoading: boolean
  }
  input: {
    enteredDays: string
    enteredAmount: string
    setEnteredDays: (value: string) => void
    handleInputChange: (input: string, maxDecimals?: number, maxBalance?: string) => void
    isAcceptableAmount: boolean
    selectedCoin: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
  dropdowns: {
    daysOptions: { label: string; value: string }[]
    batchBalanceData: TokenInfo[]
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
    riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
  }
  seriesKit: {
    series?: SolaceRiskSeries
    seriesLogos: { label: string; value: string; icon: JSX.Element }[]
  }
  policy: {
    policyId?: BigNumber
    status: boolean
    currentCoverageLimit: BigNumber
    newCoverageLimit: BigNumber
  }
}

const CoverageContext = createContext<CoverageContextType>({
  intrface: {
    navbarThreshold: false,
    showPortfolio: false,
    handleShowPortfolio: () => undefined,
    interfaceState: InterfaceState.LOADING,
    userState: InterfaceState.BUYING,
    handleUserState: () => undefined,
    portfolioLoading: true,
    seriesLoading: true,
    balancesLoading: true,
    coverageLoading: true,
  },
  input: {
    enteredDays: '',
    enteredAmount: '',
    setEnteredDays: () => undefined,
    handleInputChange: () => undefined,
    isAcceptableAmount: false,
    selectedCoin: coinsMap[1][0],
    handleSelectedCoin: () => undefined,
  },
  dropdowns: {
    daysOptions: [],
    batchBalanceData: [],
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
    riskScores: () => Promise.reject(),
  },
  seriesKit: {
    series: undefined,
    seriesLogos: [],
  },
  policy: {
    policyId: undefined,
    status: false,
    currentCoverageLimit: ZERO,
    newCoverageLimit: ZERO,
  },
})

const CoverageManager: React.FC = (props) => {
  const { appTheme, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { width } = useWindowDimensions()
  const { portfolio, riskScores, loading: portfolioLoading } = usePortfolio()
  const { series, loading: seriesLoading } = useRiskSeries()
  const { amount: enteredAmount, isAppropriateAmount, handleInputChange } = useInputAmount()
  const {
    policyId,
    status,
    coverageLimit: currentCoverageLimit,
    mounting: coverageLoading,
  } = useCheckIsCoverageActive()

  const [enteredDays, setEnteredDays] = useState<string>('')
  const [newCoverageLimit, setNewCoverageLimit] = useState<BigNumber>(ZERO)
  const [userState, setUserState] = useState<InterfaceState>(InterfaceState.BUYING)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [daysOpen, setDaysOpen] = useState(false)
  const [coinsOpen, setCoinsOpen] = useState(false)

  const coinOptions = useMemo(() => coinsMap[activeNetwork.chainId] ?? [], [activeNetwork])
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions.map((c) => c.address))

  const loading = useMemo(() => portfolioLoading || seriesLoading || balancesLoading || coverageLoading, [
    portfolioLoading,
    seriesLoading,
    balancesLoading,
    coverageLoading,
  ])

  const interfaceState = useMemo(() => (loading ? InterfaceState.LOADING : userState), [loading, userState])
  const navbarThreshold = useMemo(() => width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR), [rightSidebar, width])
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

  const [selectedCoin, setSelectedCoin] = useState<ReadToken>(coinOptions[0])

  const batchBalanceData = useMemo(
    () =>
      batchBalances.map((b, i) => {
        return { balance: b.balance, ...coinOptions[i] }
      }),
    [coinOptions, batchBalances]
  )

  const isAcceptableAmount = useMemo(() => {
    const selectedBalance = batchBalances.find((b) => b.addr === selectedCoin.address)
    if (!selectedBalance) return false
    return isAppropriateAmount(enteredAmount, selectedCoin.decimals, selectedBalance.balance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances, enteredAmount, selectedCoin.address, selectedCoin.decimals])

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

  const highestPosition = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolio]
  )

  const handleNewCoverageLimit = useCallback((coverageLimit: BigNumber) => {
    setNewCoverageLimit(coverageLimit)
  }, [])

  const handleSelectedCoin = useCallback(
    (addr: string) => {
      const coin = coinOptions.find((c) => c.address === addr)
      if (coin) setSelectedCoin(coin)
    },
    [coinOptions]
  )

  const handleUserState = useCallback((state: InterfaceState) => {
    setUserState(state)
  }, [])

  const handleShowPortfolio = useCallback((show: boolean) => {
    setShowPortfolio(show)
  }, [])

  useEffect(() => {
    if (!highestPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    handleNewCoverageLimit(bnHigherBal)
  }, [highestPosition, handleNewCoverageLimit])

  const value = useMemo<CoverageContextType>(
    () => ({
      intrface: {
        navbarThreshold,
        showPortfolio,
        handleShowPortfolio,
        interfaceState,
        userState,
        handleUserState,
        portfolioLoading,
        seriesLoading,
        balancesLoading,
        coverageLoading,
      },
      input: {
        enteredDays,
        enteredAmount,
        setEnteredDays,
        handleInputChange,
        isAcceptableAmount,
        selectedCoin,
        handleSelectedCoin,
      },
      dropdowns: {
        daysOptions,
        batchBalanceData,
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
        riskScores,
      },
      seriesKit: {
        series,
        seriesLogos,
      },
      policy: {
        policyId,
        status,
        currentCoverageLimit,
        newCoverageLimit,
      },
    }),
    [
      navbarThreshold,
      daysOpen,
      batchBalanceData,
      enteredDays,
      enteredAmount,
      daysOptions,
      coinsOpen,
      bigButtonStyle,
      gradientStyle,
      interfaceState,
      portfolio,
      portfolioLoading,
      seriesLoading,
      balancesLoading,
      series,
      seriesLogos,
      showPortfolio,
      isAcceptableAmount,
      userState,
      selectedCoin,
      coverageLoading,
      currentCoverageLimit,
      newCoverageLimit,
      policyId,
      status,
      riskScores,
      handleInputChange,
      handleSelectedCoin,
      handleUserState,
      handleShowPortfolio,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
