import { useMemo, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { ADDRESS_ZERO, GAS_LIMIT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, NetworkConfig, SolaceRiskScore } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'
import { getSolaceRiskBalances, getSolaceRiskScores } from '../../utils/api'
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { rangeFrom0 } from '../../utils/numeric'
import { withBackoffRetries } from '../../utils/time'

export const useFunctions = () => {
  const { keyContracts } = useContracts()
  const { activeNetwork } = useNetwork()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getAvailableCoverCapacity = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.availableCoverCapacity())
      return d
    } catch (e) {
      console.log('error getAvailableCoverCapacity ', e)
      return ZERO
    }
  }

  const getMaxCover = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.maxCover())
      return d
    } catch (e) {
      console.log('error getMaxCover ', e)
      return ZERO
    }
  }

  const getActiveCoverLimit = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.activeCoverLimit())
      return d
    } catch (e) {
      console.log('error getActiveCoverLimit ', e)
      return ZERO
    }
  }

  const getPolicyCount = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.policyCount())
      return d
    } catch (e) {
      console.log('error getPolicyCount ', e)
      return ZERO
    }
  }

  const getCooldownPeriod = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.cooldownPeriod())
      return d
    } catch (e) {
      console.log('error getCooldownPeriod ', e)
      return ZERO
    }
  }

  const getReferralReward = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.referralReward())
      return d
    } catch (e) {
      console.log('error getReferralReward ', e)
      return ZERO
    }
  }

  const getPolicyStatus = async (policyId: BigNumber): Promise<boolean> => {
    if (!solaceCoverProduct) return true
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.policyStatus(policyId))
      return d
    } catch (e) {
      console.log('error getPolicyStatus ', e)
      return true
    }
  }

  const getCoverLimitOf = async (policyId: BigNumber): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.coverLimitOf(policyId))
      return d
    } catch (e) {
      console.log('error getCoverLimitOf ', e)
      return ZERO
    }
  }

  const getIsReferralCodeUsed = async (account: string): Promise<boolean> => {
    if (!solaceCoverProduct) return true
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.isReferralCodeUsed(account))
      return d
    } catch (e) {
      console.log('error getIsReferralCodeUsed ', e)
      return true
    }
  }

  const getRewardPointsOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.rewardPointsOf(account))
      return d
    } catch (e) {
      console.log('error getRewardPointsOf ', e)
      return ZERO
    }
  }

  const getAccountBalanceOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.accountBalanceOf(account))
      return d
    } catch (e) {
      console.log('error getAccountBalanceOf ', e)
      return ZERO
    }
  }

  const getPolicyOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.policyOf(account))
      return d
    } catch (e) {
      console.log('error getPolicyOf ', e)
      return ZERO
    }
  }

  const getCooldownStart = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.cooldownStart(account))
      return d
    } catch (e) {
      console.log('error getCooldownStart ', e)
      return ZERO
    }
  }

  const getMinRequiredAccountBalance = async (coverLimit: BigNumber): Promise<BigNumber> => {
    if (!solaceCoverProduct) return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.minRequiredAccountBalance(coverLimit))
      return d
    } catch (e) {
      console.log('error getMinRequiredAccountBalance ', e)
      return ZERO
    }
  }

  const getIsReferralCodeValid = async (account: string): Promise<boolean> => {
    if (!solaceCoverProduct) return false
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.isReferralCodeValid(account))
      return d
    } catch (e) {
      console.log('error getIsReferralCodeValid ', e)
      return false
    }
  }

  const getReferrerFromReferralCode = async (referralCode: string | undefined): Promise<string> => {
    if (!solaceCoverProduct) return ADDRESS_ZERO
    try {
      const d = await withBackoffRetries(async () =>
        solaceCoverProduct.getReferrerFromReferralCode(referralCode ? referralCode : [])
      )
      return d
    } catch (e) {
      console.log('error getReferrerFromReferralCode ', e)
      return ADDRESS_ZERO
    }
  }

  const getNumSupportedChains = async (): Promise<BigNumber> => {
    if (!solaceCoverProduct || activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo != 'v2') return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.numSupportedChains())
      return d
    } catch (e) {
      console.log('error getNumSupportedChains ', e)
      return ZERO
    }
  }

  const getChain = async (chainIndex: BigNumber): Promise<BigNumber> => {
    if (!solaceCoverProduct || activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo != 'v2') return ZERO
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.getChain(chainIndex))
      return d
    } catch (e) {
      console.log('error getNumSupportedChains ', e)
      return ZERO
    }
  }

  const getPolicyChainInfo = async (policyId: BigNumber): Promise<BigNumber[]> => {
    if (
      !solaceCoverProduct ||
      activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo != 'v2' ||
      policyId.isZero()
    )
      return []
    try {
      const d = await withBackoffRetries(async () => solaceCoverProduct.getPolicyChainInfo(policyId))
      return d
    } catch (e) {
      console.log('error getNumSupportedChains ', e)
      return []
    }
  }

  const updatePolicyChainInfo = async (chains: BigNumber[]) => {
    if (!solaceCoverProduct || activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo != 'v2')
      return { tx: null, localTx: null }
    const tx = await solaceCoverProduct.updatePolicyChainInfo(chains, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_UPDATE_CHAINS,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const activatePolicy = async (
    account: string,
    coverLimit: BigNumber,
    deposit: BigNumber,
    referralCode: string | [],
    chains: BigNumber[]
  ) => {
    if (!solaceCoverProduct) return { tx: null, localTx: null }
    let tx = undefined
    const useV2 = activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2'
    if (useV2) {
      tx = await solaceCoverProduct.activatePolicy(account, coverLimit, deposit, referralCode, chains, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
    } else {
      tx = await solaceCoverProduct.activatePolicy(account, coverLimit, deposit, referralCode, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_ACTIVATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const deactivatePolicy = async () => {
    if (!solaceCoverProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverProduct.deactivatePolicy({
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_DEACTIVATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const updateCoverLimit = async (newCoverageLimit: BigNumber, referralCode: string | []) => {
    if (!solaceCoverProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverProduct.updateCoverLimit(newCoverageLimit, referralCode, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_UPDATE_LIMIT,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const deposit = async (account: string, deposit: BigNumber) => {
    if (!solaceCoverProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverProduct.deposit(account, deposit, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_DEPOSIT,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdraw = async () => {
    if (!solaceCoverProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverProduct.withdraw({
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_WITHDRAW,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return {
    getAvailableCoverCapacity,
    getIsReferralCodeUsed,
    getIsReferralCodeValid,
    getMaxCover,
    getActiveCoverLimit,
    getPolicyCount,
    getCooldownPeriod,
    getReferralReward,
    getPolicyStatus,
    getCoverLimitOf,
    getRewardPointsOf,
    getAccountBalanceOf,
    getPolicyOf,
    getCooldownStart,
    getMinRequiredAccountBalance,
    getReferrerFromReferralCode,
    getNumSupportedChains,
    getChain,
    getPolicyChainInfo,
    updatePolicyChainInfo,
    activatePolicy,
    deactivatePolicy,
    updateCoverLimit,
    deposit,
    withdraw,
  }
}

export const usePortfolio = (
  account: string | undefined,
  chains: number[],
  chainsLoading: boolean
): { portfolio: SolaceRiskScore | undefined; loading: boolean } => {
  const [score, setScore] = useState<SolaceRiskScore | undefined>(undefined)
  const { networks, activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getPortfolio = async () => {
      const useV2 =
        activeNetwork.config.keyContracts.solaceCoverProduct &&
        activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2'
      if (!account || (useV2 && chains.length == 0) || chainsLoading) return
      const balances = await getSolaceRiskBalances(account, useV2 ? chains : [1])
      if (!balances) {
        console.log('balances do not exist from risk api')
        setLoading(false)
        return
      }
      const scores = await getSolaceRiskScores(account, balances)
      if (scores) setScore(scores)
      setLoading(false)
    }
    getPortfolio()
  }, [account, networks, activeNetwork, chainsLoading, chains])

  useEffect(() => {
    setLoading(true)
  }, [account])

  return { portfolio: score, loading }
}

export const useCooldownDetails = (
  account: string | undefined
): { isCooldownActive: boolean; cooldownStart: BigNumber; cooldownPeriod: BigNumber; cooldownLeft: BigNumber } => {
  const { latestBlock } = useProvider()
  const { getCooldownPeriod, getCooldownStart } = useFunctions()
  const { version } = useCachedData()

  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(true)
  const [cooldownStart, setCooldownStart] = useState<BigNumber>(ZERO)
  const [cooldownPeriod, setCooldownPeriod] = useState<BigNumber>(ZERO)
  const [cooldownLeft, setCooldownLeft] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const getCooldownAssessment = async () => {
      if (!latestBlock || !account) return
      const cooldownStart = await getCooldownStart(account)
      setCooldownStart(cooldownStart)
      if (!cooldownStart.isZero()) {
        const cooldownPeriod = await getCooldownPeriod()
        setCooldownPeriod(cooldownPeriod)
        const timePassed = latestBlock.timestamp - cooldownStart.toNumber()
        if (timePassed > cooldownPeriod.toNumber()) {
          setIsCooldownActive(false)
          setCooldownLeft(ZERO)
        } else {
          setIsCooldownActive(true)
          setCooldownLeft(cooldownPeriod.sub(BigNumber.from(timePassed)))
        }
      } else {
        setIsCooldownActive(false)
        setCooldownLeft(ZERO)
      }
    }
    getCooldownAssessment()
  }, [account, latestBlock, version])

  return { isCooldownActive, cooldownStart, cooldownPeriod, cooldownLeft }
}

export const useCheckIsCoverageActive = (account: string | undefined) => {
  const { getPolicyOf, getPolicyStatus, getCoverLimitOf } = useFunctions()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const [policyId, setPolicyId] = useState<BigNumber | undefined>(undefined)
  const [status, setStatus] = useState<boolean>(false)
  const [coverageLimit, setCoverageLimit] = useState<BigNumber>(ZERO)
  const [mounting, setMounting] = useState<boolean>(true)

  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])

  useEffect(() => {
    const getStatus = async () => {
      if (!account || !latestBlock || !solaceCoverProduct) {
        setPolicyId(undefined)
        setStatus(false)
        setCoverageLimit(ZERO)
        return
      }
      const policyId = await getPolicyOf(account)
      if (policyId.isZero()) {
        setPolicyId(ZERO)
        setStatus(false)
        setCoverageLimit(ZERO)
      } else {
        const status = await getPolicyStatus(policyId)
        const coverLimit = await getCoverLimitOf(policyId)
        setPolicyId(policyId)
        setStatus(status)
        setCoverageLimit(coverLimit)
      }
      setMounting(false)
    }
    getStatus()
  }, [account, latestBlock, solaceCoverProduct, version])

  return { policyId, status, coverageLimit, mounting }
}

export const useTotalAccountBalance = (account: string | undefined) => {
  const { getAccountBalanceOf, getRewardPointsOf } = useFunctions()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const [totalAccountBalance, setTotalAccountBalance] = useState<BigNumber>(ZERO)
  const [personalBalance, setPersonalBalance] = useState<BigNumber>(ZERO)
  const [earnedBalance, setEarnedBalance] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const getBal = async () => {
      if (!account || !latestBlock) {
        setTotalAccountBalance(ZERO)
        setPersonalBalance(ZERO)
        setEarnedBalance(ZERO)
        return
      }
      const accountBalance = await getAccountBalanceOf(account)
      const rewardPoints = await getRewardPointsOf(account)
      setTotalAccountBalance(accountBalance.add(rewardPoints))
      setPersonalBalance(accountBalance)
      setEarnedBalance(rewardPoints)
    }
    getBal()
  }, [account, latestBlock, version])

  return { totalAccountBalance, personalBalance, earnedBalance }
}

export const useSupportedChains = () => {
  const { getNumSupportedChains, getChain } = useFunctions()
  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork, networks } = useNetwork()
  const [coverableNetworks, setCoverableNetworks] = useState<NetworkConfig[]>([])
  const [coverableChains, setCoverableChains] = useState<BigNumber[]>([])

  useEffect(() => {
    const getSupportedChains = async () => {
      if (!solaceCoverProduct || activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo != 'v2') return
      const numChains = await getNumSupportedChains()
      const numChainsIndices = rangeFrom0(numChains.toNumber())
      const chains: BigNumber[] = []
      const supportedNetworks: NetworkConfig[] = []
      numChainsIndices.forEach(async (i) => {
        const chain = await getChain(BigNumber.from(i))
        chains.push(chain)
        const chainNumber = chain.toNumber()
        const network = networks.find((n) => n.chainId == chainNumber)
        if (network) supportedNetworks.push(network)
      })
      setCoverableNetworks(supportedNetworks)
      setCoverableChains(chains)
    }
    getSupportedChains()
  }, [solaceCoverProduct])

  return { coverableNetworks, coverableChains }
}
