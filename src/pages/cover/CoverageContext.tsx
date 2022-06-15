import { Price, SCP, SolaceRiskProtocol, SolaceRiskSeries } from '@solace-fi/sdk-nightly'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BKPT_2, BKPT_NAVBAR, MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { ChosenLimit, FunctionName, InterfaceState, TransactionCondition } from '../../constants/enums'
import { coinsMap } from '../../constants/mappings/coverageStablecoins'
import { NetworkConfig, ReadToken, TokenInfo } from '../../constants/types'
import { useGeneral } from '../../context/GeneralManager'
import { networks, useNetwork } from '../../context/NetworkManager'
import { useBatchBalances, useScpBalance } from '../../hooks/balance/useBalance'
import { useInputAmount, useTransactionExecution } from '../../hooks/internal/useInputAmount'
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
import { accurateMultiply, convertSciNotaToPrecise, formatAmount } from '../../utils/formatting'
import { parseUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { usePortfolioAnalysis } from '../../hooks/policy/usePortfolioAnalysis'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { useProvider } from '../../context/ProviderManager'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useNotifications } from '../../context/NotificationsManager'
import { useTokenAllowance } from '../../hooks/contract/useToken'
import SOLACE from '../../constants/metadata/SOLACE.json'

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
    importCounter: number
    simCounter: number
    simChosenLimit: ChosenLimit
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
    handleImportCounter: () => void
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
    minReqScpBal: BigNumber
    impDoesMeetMinReqAccBal: boolean
    impMinReqAccBal: BigNumber
    availCovCap: BigNumber
    scpBalance: string
    scpObj?: SCP
    signatureObj: any
    depositApproval: boolean
    unlimitedApproveCPM: (tokenAddr: string) => void
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
    importCounter: 0,
    simCounter: 0,
    simChosenLimit: ChosenLimit.Recommended,
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
    handleImportCounter: () => undefined,
    handleSimCounter: () => undefined,
    handleSimChosenLimit: () => undefined,
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
    impMinReqAccBal: ZERO,
    impDoesMeetMinReqAccBal: false,
    minReqScpBal: ZERO,
    availCovCap: ZERO,
    scpBalance: '',
    scpObj: undefined,
    signatureObj: undefined,
    depositApproval: false,
    unlimitedApproveCPM: () => undefined,
  },
})

const CoverageManager: React.FC = (props) => {
  const { account } = useWeb3React()
  const { appTheme, rightSidebar } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { tokenPriceMapping, minute, reload } = useCachedData()
  const { signer, latestBlock } = useProvider()
  const { makeTxToast } = useNotifications()

  const { width } = useWindowDimensions()
  const { portfolio: curPortfolio, riskScores, loading: portfolioLoading } = usePortfolio()
  const [simPortfolio, setSimPortfolio] = useState<SolaceRiskScore | undefined>(undefined)
  const { series, loading: seriesLoading } = useRiskSeries()
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false)
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
  const { handleContractCallError } = useTransactionExecution()

  const [importedCoverLimit, setImportedCoverLimit] = useState<BigNumber>(ZERO)
  const [simCoverLimit, setSimCoverLimit] = useState<BigNumber>(ZERO)
  const [scpObj, setScpObj] = useState<SCP | undefined>(undefined)
  const [signatureObj, setSignatureObj] = useState<any>(undefined)
  const [importCounter, setImportCounter] = useState<number>(0)
  const [simCounter, setSimCounter] = useState<number>(0)
  const [simChosenLimit, setSimChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

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
  const [impMinReqAccBal, setImpMinReqAccBal] = useState<BigNumber>(ZERO)
  const [minReqScpBal, setMinReqScpBal] = useState<BigNumber>(ZERO)

  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [showCLDModal, setShowCLDModal] = useState(false)
  const [showSimCoverModal, setShowSimCoverModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showShareReferralModal, setShowShareReferralModal] = useState(false)

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

  const impDoesMeetMinReqAccBal = useMemo(() => {
    const parsedScpBalance = parseUnits(scpBalance, 18)
    const float_enteredDeposit = parseFloat(formatAmount(enteredDeposit))
    const depositUSDEquivalent = float_enteredDeposit * selectedCoinPrice
    const BN_Scp_Plus_Deposit = parsedScpBalance.add(
      BigNumber.from(accurateMultiply(convertSciNotaToPrecise(`${depositUSDEquivalent}`), 18))
    )
    return impMinReqAccBal.lte(BN_Scp_Plus_Deposit)
  }, [impMinReqAccBal, enteredDeposit, scpBalance, selectedCoinPrice])

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
      const tokenContract = new Contract(tokenAddr, IERC20.abi, signer)
      try {
        const tx: TransactionResponse = await tokenContract.approve(
          scpObj.coverPaymentManager.address,
          MAX_APPROVAL_AMOUNT
        )
        const txHash = tx.hash
        setTransactionLoading(true)
        makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
        await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
          const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
          makeTxToast(FunctionName.APPROVE, status, txHash)
          reload()
        })
        setTransactionLoading(false)
      } catch (e) {
        handleContractCallError('approve', e, FunctionName.APPROVE)
      }
    },
    [activeNetwork, signer, scpObj]
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
        resetDeposit()
        setSelectedCoin(coin)
      }
    },
    [coinOptions, resetDeposit]
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

  // const handleShowShareModal = useCallback((show: boolean) => {
  //   setShow
  // }

  const handleImportCounter = useCallback(() => {
    setImportCounter((prev) => prev + 1)
  }, [])

  const handleSimCounter = useCallback(() => {
    setSimCounter((prev) => prev + 1)
  }, [])

  const handleSimChosenLimit = useCallback((chosenLimit: ChosenLimit) => {
    setSimChosenLimit(chosenLimit)
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
    if (!curHighestPosition) return
    const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
    const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    handleImportedCoverLimit(bnHigherBal)
  }, [curHighestPosition, handleImportedCoverLimit])

  useEffect(() => {
    const init = async () => {
      const availableCoverCapacity = await getAvailableCoverCapacity()
      setAvailCovCap(availableCoverCapacity)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute])

  useEffect(() => {
    const init = async () => {
      const mrab = await getMinRequiredAccountBalance(importedCoverLimit)
      setImpMinReqAccBal(mrab)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedCoverLimit])

  useEffect(() => {
    const init = async () => {
      if (!account) return
      const msr = await getMinScpRequired(account)
      setMinReqScpBal(msr)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, account])

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
        abi = IERC20.abi
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
        interfaceState, // current interface state controlling page components
        userState, // different users see different things on the interface
        portfolioLoading,
        seriesLoading,
        balancesLoading,
        coverageLoading,
        transactionLoading,
        existingPolicyLoading,
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
        importCounter, // flag to change real CL
        simCounter, // flag of simulation
        simChosenLimit, // chosen limit for simulation
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
        handleImportCounter,
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
        impMinReqAccBal, // minimum account balance required to support an imported cover limit
        impDoesMeetMinReqAccBal, // check if the imported cover limit meets requirement
        minReqScpBal, // check how much scp should stay on the account
        availCovCap, // available cover capacity for this chain
        scpBalance, // the user's scp balance
        scpObj,
        signatureObj,
        depositApproval,
        unlimitedApproveCPM,
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
      impMinReqAccBal,
      impDoesMeetMinReqAccBal,
      minReqScpBal,
      showSimulatorModal,
      showSimCoverModal,
      showReferralModal,
      showShareReferralModal,
      scpObj,
      signatureObj,
      depositApproval,
      importCounter,
      simCounter,
      simChosenLimit,
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
