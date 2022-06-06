import { SolaceRiskProtocol, SolaceRiskSeries } from '@solace-fi/sdk-nightly'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR, ZERO } from '../../constants'
import { InterfaceState } from '../../constants/enums'
import { coinsMap } from '../../constants/mappings/coverageStablecoins'
import { NetworkConfig, ReadToken, TokenInfo } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { networks, useNetwork } from '../../context/NetworkManager'
import { useBatchBalances, useScpBalance } from '../../hooks/balance/useBalance'
import { useInputAmount } from '../../hooks/internal/useInputAmount'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import {
  usePortfolio,
  useRiskSeries,
  useCheckIsCoverageActive,
  useExistingPolicy,
  useCoverageFunctions,
} from '../../hooks/policy/useSolaceCoverProductV3'
import { BigNumber } from 'ethers'
import { SolaceRiskBalance, SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { useCachedData } from '../../context/CachedDataManager'
import { accurateMultiply, floatUnits } from '../../utils/formatting'
import { parseUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { usePortfolioAnalysis } from '../../hooks/policy/usePortfolioAnalysis'

type CoverageContextType = {
  intrface: {
    navbarThreshold: boolean
    showPortfolioModal: boolean
    handleShowPortfolioModal: (show: boolean) => void
    showCLDModal: boolean
    handleShowCLDModal: (show: boolean) => void
    interfaceState: InterfaceState
    userState: InterfaceState
    handleUserState: (state: InterfaceState) => void
    handleCtaState: (state: InterfaceState | undefined) => void
    portfolioLoading: boolean
    seriesLoading: boolean
    balancesLoading: boolean
    coverageLoading: boolean
    existingPolicyLoading: boolean
  }
  input: {
    enteredDeposit: string
    enteredWithdrawal: string
    enteredCoverLimit: BigNumber
    simCoverLimit: BigNumber
    handleEnteredDeposit: (input: string, maxDecimals?: number, maxBalance?: string) => void
    handleEnteredWithdrawal: (input: string, maxDecimals?: number, maxBalance?: string) => void
    handleSimCoverLimit: (coverageLimit: BigNumber) => void
    handleEnteredCoverLimit: (coverageLimit: BigNumber) => void
    isAcceptableDeposit: boolean
    isAcceptableWithdrawal: boolean
    selectedCoin: ReadToken
    handleSelectedCoin: (coin: string) => void
  }
  dropdowns: {
    batchBalanceData: TokenInfo[]
    coinsOpen: boolean
    setCoinsOpen: (value: boolean) => void
  }
  styles: {
    bigButtonStyle: any
    gradientStyle: any
  }
  portfolioKit: {
    curPortfolio?: SolaceRiskScore
    simPortfolio?: SolaceRiskScore
    riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
    curUsdBalanceSum: number
    curHighestPosition?: SolaceRiskProtocol
    curDailyRate: number
    curDailyCost: number
    simUsdBalanceSum: number
    simHighestPosition?: SolaceRiskProtocol
    simDailyRate: number
    simDailyCost: number
    handleSimPortfolio: (portfolio: SolaceRiskScore | undefined) => void
  }
  seriesKit: {
    series?: SolaceRiskSeries
    seriesLogos: { label: string; value: string; icon: JSX.Element }[]
  }
  policy: {
    policyId?: BigNumber
    status: boolean
    curCoverageLimit: BigNumber
    existingPolicyId: BigNumber
    existingPolicyNetwork: NetworkConfig
    minReqAccBal: BigNumber
    minReqScpBal: BigNumber
    availCovCap: BigNumber
    scpBalance: string
  }
}

const CoverageContext = createContext<CoverageContextType>({
  intrface: {
    navbarThreshold: false,
    showPortfolioModal: false,
    handleShowPortfolioModal: () => undefined,
    showCLDModal: false,
    handleShowCLDModal: () => undefined,
    interfaceState: InterfaceState.LOADING,
    userState: InterfaceState.NEW_USER,
    handleUserState: () => undefined,
    handleCtaState: () => undefined,
    portfolioLoading: true,
    seriesLoading: true,
    balancesLoading: true,
    coverageLoading: true,
    existingPolicyLoading: true,
  },
  input: {
    enteredDeposit: '',
    enteredWithdrawal: '',
    enteredCoverLimit: ZERO,
    simCoverLimit: ZERO,
    handleEnteredDeposit: () => undefined,
    handleEnteredWithdrawal: () => undefined,
    handleEnteredCoverLimit: () => undefined,
    handleSimCoverLimit: () => undefined,
    isAcceptableDeposit: false,
    isAcceptableWithdrawal: false,
    selectedCoin: coinsMap[1][0],
    handleSelectedCoin: () => undefined,
  },
  dropdowns: {
    batchBalanceData: [],
    coinsOpen: false,
    setCoinsOpen: () => undefined,
  },
  styles: {
    bigButtonStyle: {},
    gradientStyle: {},
  },
  portfolioKit: {
    curPortfolio: undefined,
    simPortfolio: undefined,
    riskScores: () => Promise.reject(),
    handleSimPortfolio: () => undefined,
    curUsdBalanceSum: 0,
    curHighestPosition: undefined,
    curDailyRate: 0,
    curDailyCost: 0,
    simUsdBalanceSum: 0,
    simHighestPosition: undefined,
    simDailyRate: 0,
    simDailyCost: 0,
  },
  seriesKit: {
    series: undefined,
    seriesLogos: [],
  },
  policy: {
    policyId: undefined,
    status: false,
    curCoverageLimit: ZERO,
    existingPolicyId: ZERO,
    existingPolicyNetwork: networks[0],
    minReqAccBal: ZERO,
    minReqScpBal: ZERO,
    availCovCap: ZERO,
    scpBalance: '',
  },
})

const CoverageManager: React.FC = (props) => {
  const { account } = useWeb3React()
  const { appTheme, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { tokenPriceMapping, minute } = useCachedData()

  const { width } = useWindowDimensions()
  const { portfolio: curPortfolio, riskScores, loading: portfolioLoading } = usePortfolio()
  const [simPortfolio, setSimPortfolio] = useState<SolaceRiskScore | undefined>()
  const { series, loading: seriesLoading } = useRiskSeries()
  const scpBalance = useScpBalance()
  const {
    amount: enteredDeposit,
    isAppropriateAmount: isAppropriateDeposit,
    handleInputChange: handleEnteredDeposit,
  } = useInputAmount()
  const {
    amount: enteredWithdrawal,
    isAppropriateAmount: isAppropriateWithdrawal,
    handleInputChange: handleEnteredWithdrawal,
  } = useInputAmount()
  const { getAvailableCoverCapacity, getMinRequiredAccountBalance, getMinScpRequired } = useCoverageFunctions()
  const { policyId, status, coverageLimit: curCoverageLimit, mounting: coverageLoading } = useCheckIsCoverageActive()

  const [enteredCoverLimit, setEnteredCoverLimit] = useState<BigNumber>(ZERO)
  const [simCoverLimit, setSimCoverLimit] = useState<BigNumber>(ZERO)

  const {
    highestPosition: curHighestPosition,
    usdBalanceSum: curUsdBalanceSum,
    dailyRate: curDailyRate,
    dailyCost: curDailyCost,
  } = usePortfolioAnalysis(curPortfolio, curCoverageLimit)
  const {
    highestPosition: simHighestPosition,
    usdBalanceSum: simUsdBalanceSum,
    dailyRate: simDailyRate,
    dailyCost: simDailyCost,
  } = usePortfolioAnalysis(simPortfolio, simCoverLimit)

  const [availCovCap, setAvailCovCap] = useState<BigNumber>(ZERO)
  const [minReqAccBal, setMinReqAccBal] = useState<BigNumber>(ZERO)
  const [minReqScpBal, setMinReqScpBal] = useState<BigNumber>(ZERO)

  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showCLDModal, setShowCLDModal] = useState(false)

  const [coinsOpen, setCoinsOpen] = useState(false)
  const {
    policyId: existingPolicyId,
    network: existingPolicyNetwork,
    loading: existingPolicyLoading,
  } = useExistingPolicy()

  const coinOptions = useMemo(() => coinsMap[activeNetwork.chainId] ?? [], [activeNetwork])
  const { loading: balancesLoading, batchBalances } = useBatchBalances(coinOptions.map((c) => c.address))

  const loading = useMemo(
    () => portfolioLoading || seriesLoading || balancesLoading || coverageLoading || existingPolicyLoading,
    [portfolioLoading, seriesLoading, balancesLoading, coverageLoading, existingPolicyLoading]
  )

  const [userState, setUserState] = useState<InterfaceState>(InterfaceState.NEW_USER)
  const [ctaState, setCtaState] = useState<InterfaceState | undefined>(undefined)
  const interfaceState = useMemo(() => (loading ? InterfaceState.LOADING : ctaState ?? userState), [
    loading,
    userState,
    ctaState,
  ])
  const navbarThreshold = useMemo(() => width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR), [rightSidebar, width])
  const seriesLogos = useMemo(() => {
    return series
      ? series.data.protocolMap.map((s) => {
          return {
            label: s.appId,
            value: s.appId,
            icon: <img src={`https://assets.solace.fi/zapperLogos/${s.appId}`} height={24} />,
          }
        })
      : []
  }, [series])

  const [selectedCoin, setSelectedCoin] = useState<ReadToken>(coinOptions[0])

  const batchBalanceData = useMemo(() => {
    return batchBalances.map((b, i) => {
      return { balance: b.balance, ...coinOptions[i] }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinOptions, batchBalances.length])

  const isAcceptableDeposit = useMemo(() => {
    const selectedBalance = batchBalances.find((b) => b.addr === selectedCoin.address)
    if (!selectedBalance) return false
    return isAppropriateDeposit(enteredDeposit, selectedCoin.decimals, selectedBalance.balance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances, enteredDeposit, selectedCoin.address, selectedCoin.decimals])

  const isAcceptableWithdrawal = useMemo(() => {
    const solacePrice = tokenPriceMapping['solace']
    if (!solacePrice) return false
    return isAppropriateWithdrawal(
      enteredWithdrawal,
      18,
      BigNumber.from(accurateMultiply(solacePrice, 18)).mul(parseUnits(scpBalance, 18))
    )
  }, [enteredWithdrawal, scpBalance, tokenPriceMapping, isAppropriateWithdrawal])

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

  const handleSimCoverLimit = useCallback((coverageLimit: BigNumber) => {
    setSimCoverLimit(coverageLimit)
  }, [])

  const handleEnteredCoverLimit = useCallback((coverageLimit: BigNumber) => {
    setEnteredCoverLimit(coverageLimit)
  }, [])

  const handleSelectedCoin = useCallback(
    (addr: string) => {
      const coin = coinOptions.find((c) => c.address === addr)
      if (coin) setSelectedCoin(coin)
    },
    [coinOptions]
  )

  const handleSimPortfolio = useCallback((portfolioScore: SolaceRiskScore | undefined) => {
    setSimPortfolio(portfolioScore)
  }, [])

  const handleUserState = useCallback((state: InterfaceState) => {
    if (state == InterfaceState.NEW_USER || InterfaceState.CURRENT_USER || InterfaceState.RETURNING_USER)
      setUserState(state)
  }, [])

  const handleCtaState = useCallback((state: InterfaceState | undefined) => {
    if (state == InterfaceState.DEPOSITING || InterfaceState.WITHDRAWING || undefined) setCtaState(state)
  }, [])

  const handleShowPortfolioModal = useCallback((show: boolean) => {
    setShowPortfolioModal(show)
  }, [])

  const handleShowCLDModal = useCallback((show: boolean) => {
    setShowCLDModal(show)
  }, [])

  useEffect(() => {
    if (!curHighestPosition) return
    const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
    const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    handleEnteredCoverLimit(bnHigherBal)
  }, [curHighestPosition, handleEnteredCoverLimit])

  useEffect(() => {
    const init = async () => {
      const availableCoverCapacity = await getAvailableCoverCapacity()
      setAvailCovCap(availableCoverCapacity)
    }
    init()
  }, [minute])

  useEffect(() => {
    const init = async () => {
      const mrab = await getMinRequiredAccountBalance(enteredCoverLimit)
      setMinReqAccBal(mrab)
    }
    init()
  }, [enteredCoverLimit])

  useEffect(() => {
    const init = async () => {
      if (!account) return
      const availableCoverCapacity = await getMinScpRequired(account)
      setMinReqScpBal(availableCoverCapacity)
    }
    init()
  }, [minute, account])

  const value = useMemo<CoverageContextType>(
    () => ({
      intrface: {
        navbarThreshold,
        showPortfolioModal,
        showCLDModal,
        interfaceState,
        userState,
        portfolioLoading,
        seriesLoading,
        balancesLoading,
        coverageLoading,
        existingPolicyLoading,
        handleShowPortfolioModal,
        handleShowCLDModal,
        handleUserState,
        handleCtaState,
      },
      input: {
        enteredDeposit,
        enteredWithdrawal,
        enteredCoverLimit,
        simCoverLimit,
        isAcceptableDeposit,
        isAcceptableWithdrawal,
        selectedCoin,
        handleEnteredDeposit,
        handleEnteredWithdrawal,
        handleEnteredCoverLimit,
        handleSimCoverLimit,
        handleSelectedCoin,
      },
      dropdowns: {
        batchBalanceData,
        coinsOpen,
        setCoinsOpen,
      },
      styles: {
        bigButtonStyle,
        gradientStyle,
      },
      portfolioKit: {
        curPortfolio,
        simPortfolio,
        curUsdBalanceSum,
        curHighestPosition,
        curDailyRate,
        curDailyCost,
        simUsdBalanceSum,
        simHighestPosition,
        simDailyRate,
        simDailyCost,
        riskScores,
        handleSimPortfolio,
      },
      seriesKit: {
        series,
        seriesLogos,
      },
      policy: {
        policyId,
        status,
        curCoverageLimit,
        existingPolicyId,
        existingPolicyNetwork,
        minReqAccBal,
        minReqScpBal,
        availCovCap,
        scpBalance,
      },
    }),
    [
      navbarThreshold,
      batchBalanceData,
      coinsOpen,
      bigButtonStyle,
      gradientStyle,
      interfaceState,
      portfolioLoading,
      seriesLoading,
      balancesLoading,
      series,
      seriesLogos,
      showPortfolioModal,
      userState,
      selectedCoin,
      coverageLoading,
      curCoverageLimit,
      policyId,
      status,
      existingPolicyId,
      existingPolicyNetwork,
      existingPolicyLoading,
      enteredDeposit,
      enteredWithdrawal,
      isAcceptableDeposit,
      isAcceptableWithdrawal,
      enteredCoverLimit,
      availCovCap,
      scpBalance,
      curPortfolio,
      simPortfolio,
      curUsdBalanceSum,
      curHighestPosition,
      curDailyRate,
      curDailyCost,
      simUsdBalanceSum,
      simHighestPosition,
      simDailyRate,
      simDailyCost,
      simCoverLimit,
      showCLDModal,
      minReqAccBal,
      minReqScpBal,
      handleEnteredCoverLimit,
      handleSimPortfolio,
      handleSimCoverLimit,
      handleShowCLDModal,
      riskScores,
      handleSelectedCoin,
      handleUserState,
      handleShowPortfolioModal,
      handleEnteredDeposit,
      handleEnteredWithdrawal,
      handleCtaState,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
