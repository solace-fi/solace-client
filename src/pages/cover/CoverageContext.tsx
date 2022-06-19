import { Price, SCP, SolaceRiskProtocol, SolaceRiskSeries } from '@solace-fi/sdk-nightly'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR, ZERO } from '../../constants'
import { ApiStatus, ChosenLimit, InterfaceState } from '../../constants/enums'
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
import { BigNumber, Contract } from 'ethers'
import { SolaceRiskBalance, SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { useCachedData } from '../../context/CachedDataManager'
import { accurateMultiply, formatAmount, truncateValue } from '../../utils/formatting'
import { parseUnits } from 'ethers/lib/utils'
import { usePortfolioAnalysis } from '../../hooks/policy/usePortfolioAnalysis'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { useProvider } from '../../context/ProviderManager'
import { ERC20_ABI } from '../../constants/abi'
import { useTokenAllowance, useTokenInfiniteApprove } from '../../hooks/contract/useToken'
import SOLACE from '../../constants/abi/SOLACE.json'
import useReferralApi from '../../hooks/api/useReferralApi'

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
    showReferralModal: boolean
    handleShowReferralModal: (show: boolean) => void
    showShareReferralModal: boolean
    handleShowShareReferralModal: (show: boolean) => void
    showCodeNoticeModal: boolean
    handleShowCodeNoticeModal: (show: boolean) => void
    interfaceState: InterfaceState
    userState: InterfaceState
    handleUserState: (state: InterfaceState) => void
    handleCtaState: (state: InterfaceState | undefined) => void
    handleTransactionLoading: (setLoading: boolean) => void
    portfolioLoading: boolean
    seriesLoading: boolean
    balancesLoading: boolean
    coverageLoading: boolean
    existingPolicyLoading: boolean
    transactionLoading: boolean
  }
  input: {
    enteredDeposit: string
    enteredWithdrawal: string
    importedCoverLimit: BigNumber
    simCoverLimit: BigNumber
    handleEnteredDeposit: (input: string, maxDecimals?: number, maxBalance?: string) => void
    handleEnteredWithdrawal: (input: string, maxDecimals?: number, maxBalance?: string) => void
    handleSimCoverLimit: (coverageLimit: BigNumber) => void
    handleImportedCoverLimit: (coverageLimit: BigNumber) => void
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
    fetchStatus: number
    curPortfolio?: SolaceRiskScore
    curUsdBalanceSum: number
    curHighestPosition?: SolaceRiskProtocol
    curDailyRate: number
    curDailyCost: number
    riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
  }
  simulator: {
    importCounter: number
    simCounter: number
    clearCounter: number
    simChosenLimit: ChosenLimit
    simPortfolio?: SolaceRiskScore
    simUsdBalanceSum: number
    simHighestPosition?: SolaceRiskProtocol
    simDailyRate: number
    simDailyCost: number
    handleSimPortfolio: (portfolio: SolaceRiskScore | undefined) => void
    handleImportCounter: () => void
    handleClearCounter: () => void
    handleSimCounter: () => void
    handleSimChosenLimit: (limit: ChosenLimit) => void
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
    availCovCap: BigNumber
    scpBalance: string
    scpObj?: SCP
    signatureObj: any
    depositApproval: boolean
    unlimitedApproveCPM: (tokenAddr: string) => void
  }
  referral: {
    appliedReferralCode?: string
    earnedAmount?: number
    referredCount?: number
    userReferralCode?: string
    cookieReferralCode?: string
    cookieCodeUsable: boolean
    handleCookieReferralCode: (code: string | undefined) => void
    applyReferralCode: (referral_code: string, policy_id: number, chain_id: number) => Promise<boolean>
    codeApplicationStatus: string
    handleCodeApplicationStatus: (status: string) => void
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
    showReferralModal: false,
    handleShowReferralModal: () => undefined,
    showShareReferralModal: false,
    handleShowShareReferralModal: () => undefined,
    showCodeNoticeModal: false,
    handleShowCodeNoticeModal: () => undefined,
    interfaceState: InterfaceState.NEW_USER,
    userState: InterfaceState.NEW_USER,
    handleUserState: () => undefined,
    handleCtaState: () => undefined,
    portfolioLoading: true,
    seriesLoading: true,
    balancesLoading: true,
    coverageLoading: true,
    existingPolicyLoading: true,
    transactionLoading: false,
    handleTransactionLoading: () => undefined,
  },
  input: {
    enteredDeposit: '',
    enteredWithdrawal: '',
    importedCoverLimit: ZERO,
    simCoverLimit: ZERO,
    handleEnteredDeposit: () => undefined,
    handleEnteredWithdrawal: () => undefined,
    handleImportedCoverLimit: () => undefined,
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
    fetchStatus: 0,
    curPortfolio: undefined,
    curUsdBalanceSum: 0,
    curHighestPosition: undefined,
    curDailyRate: 0,
    curDailyCost: 0,
    riskScores: () => Promise.reject(),
  },
  simulator: {
    importCounter: 0,
    simCounter: 0,
    clearCounter: 0,
    simChosenLimit: ChosenLimit.Recommended,
    simPortfolio: undefined,
    simUsdBalanceSum: 0,
    simHighestPosition: undefined,
    simDailyRate: 0,
    simDailyCost: 0,
    handleImportCounter: () => undefined,
    handleSimCounter: () => undefined,
    handleClearCounter: () => undefined,
    handleSimChosenLimit: () => undefined,
    handleSimPortfolio: () => undefined,
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
    availCovCap: ZERO,
    scpBalance: '',
    scpObj: undefined,
    signatureObj: undefined,
    depositApproval: false,
    unlimitedApproveCPM: () => undefined,
  },
  referral: {
    appliedReferralCode: undefined,
    earnedAmount: 0,
    referredCount: 0,
    userReferralCode: undefined,
    cookieReferralCode: undefined,
    cookieCodeUsable: false,
    handleCookieReferralCode: () => undefined,
    applyReferralCode: () => Promise.reject(),
    codeApplicationStatus: ApiStatus.IDLE,
    handleCodeApplicationStatus: () => undefined,
  },
})

const CoverageManager: React.FC = (props) => {
  const { appTheme, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { tokenPriceMapping, minute } = useCachedData()
  const { signer, latestBlock } = useProvider()

  const { width } = useWindowDimensions()
  const { portfolio: curPortfolio, riskScores, loading: portfolioLoading, fetchStatus } = usePortfolio()
  const [simPortfolio, setSimPortfolio] = useState<SolaceRiskScore | undefined>(undefined)
  const { series, loading: seriesLoading } = useRiskSeries()
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)
  const scpBalance = useScpBalance()
  const {
    amount: enteredDeposit,
    isAppropriateAmount: isAppropriateDeposit,
    handleInputChange: handleEnteredDeposit,
  } = useInputAmount()
  const { amount: enteredWithdrawal, handleInputChange: handleEnteredWithdrawal } = useInputAmount()
  const { getAvailableCoverCapacity } = useCoverageFunctions()
  const { policyId, status, coverageLimit: curCoverageLimit, mounting: coverageLoading } = useCheckIsCoverageActive()

  const {
    appliedReferralCode,
    earnedAmount,
    referredCount,
    userReferralCode,
    cookieReferralCode,
    setCookieReferralCode,
    applyReferralCode,
    cookieCodeUsable,
  } = useReferralApi()

  const [importedCoverLimit, setImportedCoverLimit] = useState<BigNumber>(ZERO)
  const [simCoverLimit, setSimCoverLimit] = useState<BigNumber>(ZERO)
  const [scpObj, setScpObj] = useState<SCP | undefined>(undefined)
  const [signatureObj, setSignatureObj] = useState<any>(undefined)
  const [importCounter, setImportCounter] = useState<number>(0)
  const [simCounter, setSimCounter] = useState<number>(0)
  const [clearCounter, setClearCounter] = useState<number>(0)
  const [simChosenLimit, setSimChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)
  const [codeApplicationStatus, setCodeApplicationStatus] = useState<string>(ApiStatus.IDLE)

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
  const { unlimitedApprove } = useTokenInfiniteApprove(setTransactionLoading)

  const [availCovCap, setAvailCovCap] = useState<BigNumber>(ZERO)

  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [showCLDModal, setShowCLDModal] = useState(false)
  const [showSimCoverModal, setShowSimCoverModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showShareReferralModal, setShowShareReferralModal] = useState(false)
  const [showCodeNoticeModal, setShowCodeNoticeModal] = useState(false)

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

  const [userState, setUserState] = useState<InterfaceState>(InterfaceState.NEW_USER)
  const [ctaState, setCtaState] = useState<InterfaceState | undefined>(undefined)
  const interfaceState = useMemo(() => ctaState ?? userState, [userState, ctaState])
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

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const depositApproval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    enteredDeposit && enteredDeposit != '.' ? parseUnits(enteredDeposit, selectedCoin.decimals).toString() : '0'
  )

  const batchBalanceData = useMemo(() => {
    return batchBalances.map((b, i) => {
      return { balance: b.balance, ...coinOptions[i] }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances.length])

  const isAcceptableDeposit = useMemo(() => {
    const selectedBalance = batchBalances.find((b) => b.addr === selectedCoin.address)
    if (!selectedBalance) return false
    return isAppropriateDeposit(enteredDeposit, selectedCoin.decimals, selectedBalance.balance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalances, enteredDeposit, selectedCoin.address, selectedCoin.decimals])

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

  const unlimitedApproveCPM = useCallback(
    async (tokenAddr: string) => {
      if (!scpObj) return
      await unlimitedApprove(tokenAddr, ERC20_ABI, scpObj.coverPaymentManager.address)
    },
    [scpObj, unlimitedApprove]
  )

  const handleSimCoverLimit = useCallback((coverageLimit: BigNumber) => {
    setSimCoverLimit(coverageLimit)
  }, [])

  const handleImportedCoverLimit = useCallback((coverageLimit: BigNumber) => {
    setImportedCoverLimit(coverageLimit)
  }, [])

  const handleSelectedCoin = useCallback(
    (addr: string) => {
      const coin = coinOptions.find((c) => c.address === addr)
      if (coin) {
        if (coin.decimals < selectedCoin.decimals) {
          handleEnteredDeposit(truncateValue(formatAmount(enteredDeposit), coin.decimals, false))
        }
        setSelectedCoin(coin)
      }
    },
    [coinOptions, enteredDeposit, selectedCoin.decimals, handleEnteredDeposit]
  )

  const handleTransactionLoading = useCallback((setLoading: boolean) => {
    setTransactionLoading(setLoading)
  }, [])

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

  const handleCodeApplicationStatus = useCallback((status: string) => {
    setCodeApplicationStatus(status)
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

  const handleShowReferralModal = useCallback((show: boolean) => {
    setShowReferralModal(show)
  }, [])

  const handleShowShareReferralModal = useCallback((show: boolean) => {
    setShowShareReferralModal(show)
  }, [])

  const handleShowCodeNoticeModal = useCallback((show: boolean) => {
    setShowCodeNoticeModal(show)
  }, [])

  const handleImportCounter = useCallback(() => {
    setImportCounter((prev) => prev + 1)
  }, [])

  const handleSimCounter = useCallback(() => {
    setSimCounter((prev) => prev + 1)
  }, [])

  const handleClearCounter = useCallback(() => {
    setClearCounter((prev) => prev + 1)
  }, [])

  const handleSimChosenLimit = useCallback((chosenLimit: ChosenLimit) => {
    setSimChosenLimit(chosenLimit)
  }, [])

  const handleCookieReferralCode = useCallback((referralCode: string | undefined) => {
    setCookieReferralCode(referralCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const tokenWithHighestBalance = batchBalanceData.reduce((pn, cn) => (cn.balance.gt(pn.balance) ? cn : pn), {
      ...coinOptions[0],
      balance: ZERO,
    })
    setSelectedCoin(tokenWithHighestBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData])

  useEffect(() => {
    if (!curHighestPosition) {
      handleImportedCoverLimit(ZERO)
    } else {
      const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
      const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
      handleImportedCoverLimit(bnHigherBal)
    }
  }, [curHighestPosition, handleImportedCoverLimit])

  useEffect(() => {
    const init = async () => {
      const availableCoverCapacity = await getAvailableCoverCapacity()
      setAvailCovCap(availableCoverCapacity)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, activeNetwork])

  useEffect(() => {
    const price = tokenPriceMapping[selectedCoin.name.toLowerCase()]
    if (price) {
      setSelectedCoinPrice(price)
    } else if (selectedCoin.stablecoin) {
      setSelectedCoinPrice(1)
    }
    let abi = null
    switch (selectedCoin.symbol) {
      case 'SOLACE':
        abi = SOLACE
        break
      default:
        abi = ERC20_ABI
    }
    setContractForAllowance(new Contract(selectedCoin.address, abi, signer))
  }, [selectedCoin, tokenPriceMapping, signer])

  useEffect(() => {
    if (!signer || activeNetwork.config.restrictedFeatures.noCoverageV3) {
      setScpObj(undefined)
      return
    }
    const scpObj = new SCP(activeNetwork.chainId, signer)
    setScpObj(scpObj)
    setSpenderAddress(scpObj.coverPaymentManager.address)
    setCtaState(undefined)
  }, [activeNetwork, signer])

  useEffect(() => {
    const getSignatureObj = async () => {
      const p = new Price()
      const priceInfo = await p.getPriceInfo()
      if (!priceInfo) {
        setSignatureObj(undefined)
        return
      }
      setSignatureObj(priceInfo)
    }
    getSignatureObj()
  }, [activeNetwork.chainId, latestBlock])

  const value = useMemo<CoverageContextType>(
    () => ({
      intrface: {
        navbarThreshold,
        showPortfolioModal, // show real portfolio modal
        showSimulatorModal, // show simulator modal
        showCLDModal, // show cover limit and deposit modal
        showSimCoverModal, // show simulated cover limit modal
        showReferralModal, // show referral modal
        showShareReferralModal, // show share referral modal
        showCodeNoticeModal,
        interfaceState, // current interface state controlling page components
        userState, // different users see different things on the interface
        portfolioLoading,
        seriesLoading,
        balancesLoading,
        coverageLoading,
        transactionLoading,
        existingPolicyLoading,
        handleShowCodeNoticeModal,
        handleShowPortfolioModal,
        handleShowSimulatorModal,
        handleShowCLDModal,
        handleShowSimCoverModal,
        handleShowReferralModal,
        handleShowShareReferralModal,
        handleUserState, // change type of user
        handleCtaState, // is the user depositing, withdrawing, or neither?
        handleTransactionLoading,
      },
      input: {
        enteredDeposit, // amount of deposit entered, in units of selected coin
        enteredWithdrawal, // amount of withdrawal entered, currently in units of SOLACE
        importedCoverLimit, // amount of cover limit entered, in units of USD
        simCoverLimit, // amount of simulated cover limit entered, in units of USD
        isAcceptableDeposit, // check if deposit is acceptable
        selectedCoin, // selected token to use for deposit (stablecoin or token)
        selectedCoinPrice, // price of selected token ($1 if stablecoin)
        handleEnteredDeposit,
        handleEnteredWithdrawal,
        handleImportedCoverLimit,
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
        fetchStatus, // status flag on risk balances fetch
        curPortfolio, // current portfolio score
        curUsdBalanceSum, // current usd sum of current portfolio
        curHighestPosition, // current highest position in portfolio
        curDailyRate, // current daily rate of current portfolio
        curDailyCost, // current daily cost of current portfolio
        riskScores, // function to get risk scores of a portfolio
      },
      simulator: {
        importCounter, // flag to change real CL
        simCounter, // flag of simulation
        clearCounter, // flag to clear simulator changes
        simChosenLimit, // chosen limit for simulation
        simPortfolio, // simulated portfolio score
        simUsdBalanceSum, // simulated usd sum of simulated portfolio
        simHighestPosition, // simulated highest position in portfolio
        simDailyRate, // simulated daily rate of simulated portfolio
        simDailyCost, // simulated daily cost of simulated portfolio
        handleSimPortfolio,
        handleImportCounter,
        handleClearCounter,
        handleSimCounter,
        handleSimChosenLimit,
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
        availCovCap, // available cover capacity for this chain
        scpBalance, // the user's scp balance
        scpObj,
        signatureObj,
        depositApproval,
        unlimitedApproveCPM,
      },
      referral: {
        appliedReferralCode,
        earnedAmount,
        referredCount,
        userReferralCode, // referral code entered
        cookieReferralCode,
        handleCookieReferralCode,
        applyReferralCode,
        codeApplicationStatus,
        cookieCodeUsable,
        handleCodeApplicationStatus,
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
      transactionLoading,
      enteredDeposit,
      enteredWithdrawal,
      isAcceptableDeposit,
      importedCoverLimit,
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
      showSimulatorModal,
      showSimCoverModal,
      showReferralModal,
      showShareReferralModal,
      showCodeNoticeModal,
      scpObj,
      signatureObj,
      depositApproval,
      importCounter,
      simCounter,
      simChosenLimit,
      fetchStatus,
      clearCounter,
      earnedAmount,
      referredCount,
      userReferralCode,
      appliedReferralCode,
      cookieReferralCode,
      codeApplicationStatus,
      cookieCodeUsable,
      handleCodeApplicationStatus,
      handleCookieReferralCode,
      applyReferralCode,
      handleClearCounter,
      handleSimChosenLimit,
      handleImportedCoverLimit,
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
      handleShowCodeNoticeModal,
      handleShowSimCoverModal,
      handleShowReferralModal,
      handleShowShareReferralModal,
      handleTransactionLoading,
      unlimitedApproveCPM,
      handleImportCounter,
      handleSimCounter,
    ]
  )
  return <CoverageContext.Provider value={value}>{props.children}</CoverageContext.Provider>
}

export function useCoverageContext(): CoverageContextType {
  return useContext(CoverageContext)
}

export default CoverageManager
