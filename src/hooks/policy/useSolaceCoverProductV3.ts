import { BigNumber, BigNumberish } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, NetworkConfig } from '../../constants/types'
import { networks, useNetwork } from '../../context/NetworkManager'
import { withBackoffRetries } from '../../utils/time'
import { useGetFunctionGas } from '../provider/useGas'
import { Risk, SolaceRiskBalance, SolaceRiskScore, SolaceRiskSeries, CoverageV3, Policy } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { useCachedData } from '../../context/CachedDataManager'
import { useProvider } from '../../context/ProviderManager'

export const useCoverageFunctions = () => {
  const { activeNetwork } = useNetwork()
  const { signer } = useProvider()
  const { gasConfig } = useGetFunctionGas()

  const coverageObj = useMemo(
    () =>
      activeNetwork.config.restrictedFeatures.noCoverageV3 ? undefined : new CoverageV3(activeNetwork.chainId, signer),
    [activeNetwork, signer]
  )

  const purchase = async (coverLimit: BigNumberish) => {
    if (!coverageObj) return { tx: null, localTx: null }
    const estGas = await coverageObj.solaceCoverProduct.estimateGas.purchase(coverLimit)
    const tx = await coverageObj.purchase(coverLimit, {
      ...gasConfig,
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_PURCHASE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const cancel = async () => {
    if (!coverageObj) return { tx: null, localTx: null }
    const estGas = await coverageObj.solaceCoverProduct.estimateGas.cancel()
    const tx = await coverageObj.cancel({
      ...gasConfig,
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.COVER_CANCEL,
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

  const policyCount = async (): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.policyCount())
      return d
    } catch (e) {
      console.log('error policyCount ', e)
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

  const debtOf = async (policyholder: string): Promise<BigNumber> => {
    if (!coverageObj) return ZERO
    try {
      const d = await withBackoffRetries(async () => coverageObj.debtOf(policyholder))
      return d
    } catch (e) {
      console.log('error debtOf ', e)
      return ZERO
    }
  }

  return {
    getActiveCoverLimit,
    getAvailableCoverCapacity,
    getMaxCover,
    getPolicyStatus,
    getMinRequiredAccountBalance,
    getMinScpRequired,
    tokenURI,
    paused,
    policyCount,
    chargeCycle,
    latestChargedTime,
    coverLimitOf,
    policyOf,
    debtOf,
    purchase,
    cancel,
  }
}

export const usePortfolio = (): {
  portfolio: SolaceRiskScore | undefined
  riskBalances: () => Promise<SolaceRiskBalance[] | undefined>
  riskScores: (balances: SolaceRiskBalance[]) => Promise<SolaceRiskScore | undefined>
  loading: boolean
} => {
  const { account } = useWeb3React()
  const [score, setScore] = useState<SolaceRiskScore | undefined>(undefined)
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)
  const fetching = useRef(false)
  const risk = useMemo(() => new Risk(), [])

  const riskBalances = useCallback(async (): Promise<SolaceRiskBalance[] | undefined> => {
    if (!account) return undefined
    const balances = await risk.getSolaceRiskBalances(account, [1, 137])
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
        return
      }
      fetching.current = true
      if (!account) {
        console.log('usePortfolio: account not found')
        fetching.current = false
        return
      }
      const balances: SolaceRiskBalance[] | undefined = await riskBalances()
      if (!balances) {
        console.log('usePortfolio: balances do not exist from risk api')
        setLoading(false)
        fetching.current = false
        return
      }
      const scores: SolaceRiskScore | undefined = await riskScores(balances)
      if (!scores) {
        console.log('usePortfolio: scores not found from risk api')
        setLoading(false)
        fetching.current = false
        return
      }
      setScore(scores)
      console.log('usePortFolio: portfolio fetched successfully')
      setLoading(false)
      fetching.current = false
    }
    getPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeNetwork])

  return { portfolio: score, riskBalances, riskScores, loading }
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
      if (series.data.protocolMap) {
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
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const [policyId, setPolicyId] = useState<BigNumber | undefined>(undefined)
  const [status, setStatus] = useState<boolean>(false)
  const [coverageLimit, setCoverageLimit] = useState<BigNumber>(ZERO)
  const [mounting, setMounting] = useState<boolean>(true)

  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const getStatus = async () => {
      if (!account || !latestBlock || activeNetwork.config.restrictedFeatures.noCoverageV3) {
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
        const status = await getPolicyStatus(policyId)
        const coverLimit = await coverLimitOf(policyId)
        setPolicyId(policyId)
        setStatus(status)
        setCoverageLimit(coverLimit)
      }
      setMounting(false)
    }
    getStatus()
  }, [account, latestBlock, activeNetwork.config.restrictedFeatures.noCoverageV3, version])

  return { policyId, status, coverageLimit, mounting }
}

export const useExistingPolicy = () => {
  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [network, setNetwork] = useState<NetworkConfig>(networks[0])
  const fetching = useRef(false)

  useEffect(() => {
    const getExistingPolicy = async () => {
      if (!account || activeNetwork.config.restrictedFeatures.noCoverageV3) {
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

      const data = await policy.getExistingPolicy_V2(account, rpcUrlMapping, false)
      if (data.length > 0) {
        const network = networks.find((n) => n.chainId === data[0].chainId)
        if (network) {
          setNetwork(network)
          setPolicyId(data[0].policyId)
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
  }, [account, latestBlock])

  useEffect(() => {
    setLoading(true)
  }, [account])

  return { policyId, network, loading }
}
