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
import { accurateMultiply, convertSciNotaToPrecise, floatUnits, formatAmount } from '../../utils/formatting'
import { parseUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { usePortfolioAnalysis } from '../../hooks/policy/usePortfolioAnalysis'
import { SOLACE_TOKEN } from '../../constants/mappings/token'

type CoverageContextType = {
  intrface: {
    navbarThreshold: boolean
    showPortfolioModal: boolean
    handleShowPortfolioModal: (show: boolean) => void
    showCLDModal: boolean
    handleShowCLDModal: (show: boolean) => void
    showSimulatorModal: boolean
    handleShowSimulatorModal: (show: boolean) => void
    showSimCoverModal: boolean
    handleShowSimCoverModal: (show: boolean) => void
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
    selectedCoin: ReadToken & { stablecoin: boolean }
    selectedCoinPrice: number
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
    doesMeetMinReqAccBal: boolean
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
    showSimulatorModal: false,
    handleShowSimulatorModal: () => undefined,
    showSimCoverModal: false,
    handleShowSimCoverModal: () => undefined,
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
    selectedCoin: { ...coinsMap[1][0], stablecoin: true },
    selectedCoinPrice: 0,
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
    doesMeetMinReqAccBal: false,
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
    resetAmount: resetDeposit,
  } = useInputAmount()
  const { amount: enteredWithdrawal, handleInputChange: handleEnteredWithdrawal } = useInputAmount()
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
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [showCLDModal, setShowCLDModal] = useState(false)
  const [showSimCoverModal, setShowSimCoverModal] = useState(false)

  const [coinsOpen, setCoinsOpen] = useState(false)
  const {
    policyId: existingPolicyId,
    network: existingPolicyNetwork,
    loading: existingPolicyLoading,
  } = useExistingPolicy()

  const coinOptions = useMemo(
    () => [
      ...(coinsMap[activeNetwork.chainId] ?? []).map((t) => {
        return { ...t, stablecoin: true }
      }),
      {
        address: SOLACE_TOKEN.address[activeNetwork.chainId],
        ...SOLACE_TOKEN.constants,
        stablecoin: false,
      },
    ],
    [activeNetwork]
  )
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

  const [selectedCoin, setSelectedCoin] = useState<ReadToken & { stablecoin: boolean }>(coinOptions[0])
  const [selectedCoinPrice, setSelectedCoinPrice] = useState<number>(0)

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

  const doesMeetMinReqAccBal = useMemo(() => {
    const parsedScpBalance = parseUnits(scpBalance, 18)
    const float_enteredDeposit = parseFloat(formatAmount(enteredDeposit))
    const depositUSDEquivalent = float_enteredDeposit * selectedCoinPrice
    const BN_Scp_Plus_Deposit = parsedScpBalance.add(
      BigNumber.from(accurateMultiply(convertSciNotaToPrecise(`${depositUSDEquivalent}`), 18))
    )
    return minReqAccBal.lte(BN_Scp_Plus_Deposit)
  }, [minReqAccBal, enteredDeposit, scpBalance, selectedCoinPrice])

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
      if (coin) {
        resetDeposit()
        setSelectedCoin(coin)
      }
    },
    [coinOptions, resetDeposit]
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

  const handleShowSimulatorModal = useCallback((show: boolean) => {
    setShowSimulatorModal(show)
  }, [])

  const handleShowCLDModal = useCallback((show: boolean) => {
    setShowCLDModal(show)
  }, [])

  const handleShowSimCoverModal = useCallback((show: boolean) => {
    setShowSimCoverModal(show)
  }, [])

  useEffect(() => {
    const tokenWithHighestBalance = batchBalanceData.reduce((pn, cn) => (cn.balance.gt(pn.balance) ? cn : pn), {
      ...coinOptions[0],
      balance: ZERO,
    })
    setSelectedCoin(tokenWithHighestBalance)
  }, [batchBalanceData])

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

  useEffect(() => {
    const price = tokenPriceMapping[selectedCoin.name.toLowerCase()]
    if (price) {
      setSelectedCoinPrice(price)
    } else if (selectedCoin.stablecoin) {
      setSelectedCoinPrice(1)
    }
  }, [selectedCoin, tokenPriceMapping])

  const value = useMemo<CoverageContextType>(
    () => ({
      intrface: {
        navbarThreshold,
        showPortfolioModal, // show real portfolio modal
        showSimulatorModal, // show simulator modal
        showCLDModal, // show cover limit and deposit modal
        showSimCoverModal, // show simulated cover limit modal
        interfaceState, // current interface state controlling page components
        userState, // different users see different things on the interface
        portfolioLoading,
        seriesLoading,
        balancesLoading,
        coverageLoading,
        existingPolicyLoading,
        handleShowPortfolioModal,
        handleShowSimulatorModal,
        handleShowCLDModal,
        handleShowSimCoverModal,
        handleUserState, // change type of user
        handleCtaState, // is the user depositing, withdrawing, or neither?
      },
      input: {
        enteredDeposit, // amount of deposit entered, in units of selected coin
        enteredWithdrawal, // amount of withdrawal entered, currently in units of SOLACE
        enteredCoverLimit, // amount of cover limit entered, in units of USD
        simCoverLimit, // amount of simulated cover limit entered, in units of USD
        isAcceptableDeposit, // check if deposit is acceptable
        selectedCoin, // selected token to use for deposit (stablecoin or token)
        selectedCoinPrice, // price of selected token ($1 if stablecoin)
        handleEnteredDeposit,
        handleEnteredWithdrawal,
        handleEnteredCoverLimit,
        handleSimCoverLimit,
        handleSelectedCoin,
      },
      dropdowns: {
        batchBalanceData, // balances of all supported payment tokens of a user
        coinsOpen, // open coin dropdown
        setCoinsOpen,
      },
      styles: {
        bigButtonStyle,
        gradientStyle,
      },
      portfolioKit: {
        curPortfolio, // current portfolio score
        simPortfolio, // simulated portfolio score
        curUsdBalanceSum, // current usd sum of current portfolio
        curHighestPosition, // current highest position in portfolio
        curDailyRate, // current daily rate of current portfolio
        curDailyCost, // current daily cost of current portfolio
        simUsdBalanceSum, // simulated usd sum of simulated portfolio
        simHighestPosition, // simulated highest position in portfolio
        simDailyRate, // simulated daily rate of simulated portfolio
        simDailyCost, // simulated daily cost of simulated portfolio
        riskScores, // function to get risk scores of a portfolio
        handleSimPortfolio,
      },
      seriesKit: {
        series,
        seriesLogos,
      },
      policy: {
        policyId, // id of policy (a user is a first-timer if id is 0)
        status, // active or inactive policy
        curCoverageLimit, // current cover limit on policy
        existingPolicyId, // id of an existing policy across all supported chains
        existingPolicyNetwork, // network of an existing policy across all supported chains
        minReqAccBal, // minimum account balance required to support an entered cover limit
        doesMeetMinReqAccBal, // check if the entered cover limit meets requirement
        minReqScpBal, // check how much scp should stay on the account
        availCovCap, // available cover capacity for this chain
        scpBalance, // the user's scp balance
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
      selectedCoinPrice,
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
      doesMeetMinReqAccBal,
      minReqScpBal,
      showSimulatorModal,
      showSimCoverModal,
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
      handleShowSimulatorModal,
      handleShowSimCoverModal,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
