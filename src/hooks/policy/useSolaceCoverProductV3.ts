import { BigNumber, BigNumberish } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, NetworkConfig } from '../../constants/types'
import { networks, useNetwork } from '../../context/NetworkManager'
import { withBackoffRetries } from '../../utils/time'
import { useGetFunctionGas } from '../provider/useGas'
import {
  Risk,
  SolaceRiskBalance,
  SolaceRiskScore,
  SolaceRiskSeries,
  CoverageV3,
  Policy,
  SCP,
} from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'
import { FunctionGasLimits } from '../../constants/mappings/gas'

export const useCoverageFunctions = () => {
  const { activeNetwork } = useNetwork()
  const { signer } = useProvider()
  const { gasConfig } = useGetFunctionGas()

  const coverageObj = useMemo(
    () => (activeNetwork.config.generalFeatures.coverageV3 ? new CoverageV3(activeNetwork.chainId, signer) : undefined),
    [activeNetwork, signer]
  )

  const scpObj = useMemo(
    () => (activeNetwork.config.generalFeatures.coverageV3 ? new SCP(activeNetwork.chainId, signer) : undefined),
    [activeNetwork, signer]
  )

  const depositStable = async (token: string, account: string, amount: BigNumberish) => {
    if (!scpObj) return { tx: null, localTx: null }
    const tx = await scpObj.depositStable(token, account, amount, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['coverPaymentManager.depositStable'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_DEPOSIT_STABLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const depositNonStable = async (
    token: string,
    account: string,
    amount: BigNumberish,
    price: BigNumber,
    priceDeadline: BigNumber,
    signature: string
  ) => {
    if (!scpObj) return { tx: null, localTx: null }
    const tx = await scpObj.depositNonStable(token, account, amount, price, priceDeadline, signature, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['coverPaymentManager.depositNonStable'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_DEPOSIT_NON_STABLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const purchaseWithStable = async (account: string, coverLimit: BigNumberish, token: string, amount: BigNumberish) => {
    if (!coverageObj) return { tx: null, localTx: null }
    // const estGas = await coverageObj.solaceCoverProduct.estimateGas.purchaseWithStable(
    //   account,
    //   coverLimit,
    //   token,
    //   amount
    // )
    const tx = await coverageObj.purchaseWithStable(account, coverLimit, token, amount, {
      ...gasConfig,
      // gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      gasLimit: FunctionGasLimits['solaceCoverProductV3.purchaseWithStable'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_PURCHASE_WITH_STABLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const purchaseWithNonStable = async (
    account: string,
    coverLimit: BigNumberish,
    token: string,
    amount: BigNumberish,
    price: BigNumberish,
    priceDeadline: BigNumberish,
    signature: string
  ) => {
    if (!coverageObj) return { tx: null, localTx: null }
    // const estGas = await coverageObj.solaceCoverProduct.estimateGas.purchaseWithNonStable(
    //   account,
    //   coverLimit,
    //   token,
    //   amount,
    //   price,
    //   priceDeadline,
    //   signature
    // )
    const tx = await coverageObj.purchaseWithNonStable(
      account,
      coverLimit,
      token,
      amount,
      price,
      priceDeadline,
      signature,
      {
        ...gasConfig,
        // gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        gasLimit: FunctionGasLimits['solaceCoverProductV3.purchaseWithNonStable'],
      }
    )
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_PURCHASE_WITH_NON_STABLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const purchase = async (account: string, coverLimit: BigNumberish) => {
    if (!coverageObj) return { tx: null, localTx: null }
    // const estGas = await coverageObj.solaceCoverProduct.estimateGas.purchase(account, coverLimit)
    const tx = await coverageObj.purchase(account, coverLimit, {
      ...gasConfig,
      // gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      gasLimit: FunctionGasLimits['solaceCoverProductV3.purchase'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_PURCHASE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const cancel = async (_premium: BigNumberish, _deadline: BigNumberish, _signature: string) => {
    if (!coverageObj) return { tx: null, localTx: null }
    // const estGas = await coverageObj.solaceCoverProduct.estimateGas.cancel()
    const tx = await coverageObj.cancel(_premium, _deadline, _signature, {
      ...gasConfig,
      // gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      gasLimit: FunctionGasLimits['solaceCoverProductV3.cancel'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_CANCEL,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdraw = async (
    account: string,
    amount: BigNumberish,
    price: BigNumber,
    priceDeadline: BigNumber,
    signature: string
  ) => {
    if (!scpObj) return { tx: null, localTx: null }
    // const estGas = await scpObj.coverPaymentManager.estimateGas.withdraw(
    //   amount,
    //   account,
    //   price,
    //   priceDeadline,
    //   signature
    // )
    const tx = await scpObj.coverPaymentManager.withdraw(amount, account, price, priceDeadline, signature, {
      ...gasConfig,
      // gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      gasLimit: FunctionGasLimits['coverPaymentManager.withdraw'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_WITHDRAW,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const getActiveCoverLimit = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.activeCoverLimit())
      return d
    } catch (e) {
      console.log('error getActiveCoverLimit ', e)
      return ZERO
    }
  }

  const getRefundableSOLACEAmount = async (
    depositor: string,
    price: BigNumber,
    priceDeadline: BigNumber,
    signature: string
  ): Promise<BigNumber> => {
    if (!scpObj) return ZERO
    try {
      const d = await withBackoffRetries(async () =>
        scpObj.getRefundableSOLACEAmount(depositor, price, priceDeadline, signature)
      )
      return d
    } catch (e) {
      console.log('error getRefundableSOLACEAmount ', e)
      return ZERO
    }
  }

  const getAvailableCoverCapacity = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.availableCoverCapacity())
      return d
    } catch (e) {
      console.log('error getAvailableCoverCapacity ', e)
      return ZERO
    }
  }

  const getMaxCover = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.maxCover())
      return d
    } catch (e) {
      console.log('error getMaxCover ', e)
      return ZERO
    }
  }

  const getPolicyStatus = async (policyId: BigNumberish): Promise<boolean> => {
    if (!coverageObj) return true
    try {
      const d = await withBackoffRetries(async () => coverageObj.policyStatus(policyId))
      return d
    } catch (e) {
      console.log('error getPolicyStatus ', e)
      return true
    }
  }

  const getMinRequiredAccountBalance = async (coverLimit: BigNumber): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.minRequiredAccountBalance(coverLimit))
      return d
    } catch (e) {
      console.log('error getMinRequiredAccountBalance ', e)
      return ZERO
    }
  }

  const getMinScpRequired = async (policyholder: string): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.minScpRequired(policyholder))
      return d
    } catch (e) {
      console.log('error getMinScpRequired ', e)
      return ZERO
    }
  }

  const tokenURI = async (policyId: BigNumberish): Promise<string> => {
    if (!coverageObj) return ''
    try {
      const d = await withBackoffRetries(async () => coverageObj.tokenURI(policyId))
      return d
    } catch (e) {
      console.log('error tokenURI ', e)
      return ''
    }
  }

  const paused = async (): Promise<boolean> => {
    if (!coverageObj) return true
    try {
      const d = await withBackoffRetries(async () => coverageObj.paused())
      return d
    } catch (e) {
      console.log('error paused ', e)
      return false
    }
  }

  const totalSupply = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.totalSupply())
      return d
    } catch (e) {
      console.log('error totalSupply ', e)
      return ZERO
    }
  }

  const chargeCycle = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.chargeCycle())
      return d
    } catch (e) {
      console.log('error chargeCycle ', e)
      return ZERO
    }
  }

  const latestChargedTime = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.latestChargedTime())
      return d
    } catch (e) {
      console.log('error latestChargedTime ', e)
      return ZERO
    }
  }

  const coverLimitOf = async (policyId: BigNumberish): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.coverLimitOf(policyId))
      return d
    } catch (e) {
      console.log('error coverLimitOf ', e)
      return ZERO
    }
  }

  const policyOf = async (policyholder: string): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.policyOf(policyholder))
      return d
    } catch (e) {
      console.log('error policyOf ', e)
      return ZERO
    }
  }

  const getBalanceOfNonRefundable = async (account: string): Promise<BigNumber> => {
    if (!scpObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => scpObj.balanceOfNonRefundable(account))
      return d
    } catch (e) {
      console.log('error getBalanceOfNonRefundable ', e)
      return ZERO
    }
  }

  return {
    getActiveCoverLimit,
    getAvailableCoverCapacity,
    getRefundableSOLACEAmount,
    getMaxCover,
    getPolicyStatus,
    getMinRequiredAccountBalance,
    getBalanceOfNonRefundable,
    getMinScpRequired,
    tokenURI,
    paused,
    totalSupply,
    chargeCycle,
    latestChargedTime,
    coverLimitOf,
    policyOf,
    purchase,
    purchaseWithStable,
    purchaseWithNonStable,
    cancel,
    withdraw,
    depositStable,
    depositNonStable,
  }
}

export const usePortfolio = (): {
  portfolio: SolaceRiskScore | undefined
  riskBalances: () => Promise<SolaceRiskBalance[] | undefined>
  riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
  fetchStatus: number
  loading: boolean
} => {
  const { account } = useWeb3React()
  const [score, setScore] = useState<SolaceRiskScore | undefined>(undefined)
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)
  const [fetchStatus, setFetchStatus] = useState(0)
  const fetching = useRef(false)
  const risk = useMemo(() => new Risk(), [])

  const riskBalances = useCallback(async (): Promise<SolaceRiskBalance[] | undefined> => {
    if (!account) return undefined
    const balances = await risk.getSolaceRiskBalances(account, [1, 137, 250, 1313161554])
    return balances
  }, [account, risk])

  const riskScores = useCallback(
    async (balances: SolaceRiskBalance[]): Promise<SolaceRiskScore | undefined> => {
      if (!account) return undefined
      const scores = await risk.getSolaceRiskScores(account, balances)
      return scores
    },
    [account, risk]
  )

  useEffect(() => {
    setLoading(true)
  }, [account])

  useEffect(() => {
    const getPortfolio = async () => {
      if (fetching.current) {
        console.log('usePortfolio: already fetching')
        setFetchStatus(1)
        return
      }
      fetching.current = true
      if (!account) {
        console.log('usePortfolio: account not found')
        fetching.current = false
        setFetchStatus(2)
        return
      }
      const balances: SolaceRiskBalance[] | undefined = await riskBalances()
      if (!balances) {
        console.log('usePortfolio: balances do not exist from risk api')
        setLoading(false)
        fetching.current = false
        setFetchStatus(3)
        return
      }
      const scores: SolaceRiskScore | undefined = await riskScores(balances)
      if (!scores) {
        console.log('usePortfolio: scores not found from risk api')
        setLoading(false)
        fetching.current = false
        setFetchStatus(4)
        return
      }
      setScore(scores)
      console.log('usePortFolio: portfolio fetched successfully')
      setFetchStatus(5)
      setLoading(false)
      fetching.current = false
    }
    getPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeNetwork])

  return { portfolio: score, riskBalances, riskScores, loading, fetchStatus }
}

export const useRiskSeries = () => {
  const [series, setSeries] = useState<SolaceRiskSeries | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const fetching = useRef(false)

  useEffect(() => {
    setLoading(true)
  }, [])

  useEffect(() => {
    const getRiskSeries = async () => {
      if (fetching.current) {
        console.log('useRiskSeries: already fetching')
        return
      }
      fetching.current = true
      const risk = new Risk()
      const series: any = await risk.getSolaceRiskSeries()
      if (series?.data?.protocolMap) {
        setSeries(series as SolaceRiskSeries)
        console.log('useRiskSeries: series fetched successfully')
        setLoading(false)
        fetching.current = false
      } else {
        console.log('useRiskSeries: series not found from risk api')
        setLoading(false)
        fetching.current = false
      }
    }
    getRiskSeries()
  }, [])

  return { series, loading }
}

export const useCheckIsCoverageActive = () => {
  const { account } = useWeb3React()
  const { policyOf, getPolicyStatus, coverLimitOf } = useCoverageFunctions()
  const { positiveVersion } = useCachedData()
  const { latestBlock } = useProvider()
  const [policyId, setPolicyId] = useState<BigNumber | undefined>(undefined)
  const [status, setStatus] = useState<boolean>(false)
  const [coverageLimit, setCoverageLimit] = useState<BigNumber>(ZERO)
  const [mounting, setMounting] = useState<boolean>(true)

  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const getStatus = async () => {
      if (!account || !latestBlock.blockNumber || !activeNetwork.config.generalFeatures.coverageV3) {
        setPolicyId(undefined)
        setStatus(false)
        setCoverageLimit(ZERO)
        return
      }
      const policyId = await policyOf(account)
      if (policyId.isZero()) {
        setPolicyId(ZERO)
        setStatus(false)
        setCoverageLimit(ZERO)
      } else {
        const [status, coverLimit] = await Promise.all([getPolicyStatus(policyId), coverLimitOf(policyId)])
        setPolicyId(policyId)
        setStatus(status)
        setCoverageLimit(coverLimit)
      }
      setMounting(false)
    }
    getStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, latestBlock.blockNumber, activeNetwork, positiveVersion])

  return { policyId, status, coverageLimit, mounting }
}

export const useExistingPolicy = (account: string | null | undefined) => {
  const { minute } = useCachedData()
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [network, setNetwork] = useState<NetworkConfig>(networks[0])
  const fetching = useRef(false)

  useEffect(() => {
    const getExistingPolicy = async () => {
      if (!account || !activeNetwork.config.generalFeatures.coverageV3) {
        setPolicyId(ZERO)
        setLoading(true)
        return
      }
      if (fetching.current) return
      fetching.current = true
      const policy = new Policy()

      const rpcUrlMapping: { [key: number]: string } = networks.reduce(
        (urls: any, network: NetworkConfig) => ({
          ...urls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      )

      const data = await policy.getExistingPolicy(account, rpcUrlMapping, false)
      if (data.length > 0) {
        const policyWithHighestCoverLimit = data.reduce((a, b) => (a.coverLimit.gt(b.coverLimit) ? a : b))
        const network = networks.find((n) => n.chainId === policyWithHighestCoverLimit.chainId)
        if (network) {
          setNetwork(network)
          setPolicyId(policyWithHighestCoverLimit.policyId)
        } else {
          setPolicyId(ZERO)
          setNetwork(networks[0])
        }
      } else {
        setPolicyId(ZERO)
        setNetwork(networks[0])
      }
      setLoading(false)
      fetching.current = false
    }
    getExistingPolicy()
  }, [account, activeNetwork, minute])

  useEffect(() => {
    setLoading(true)
  }, [account])

  return { policyId, network, loading }
}
