import { useMemo, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx, SolaceRiskProtocol } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { useGetFunctionGas } from './useGas'
import { getSolaceRiskBalances, getSolaceRiskScores } from '../utils/api'
import { useProvider } from '../context/ProviderManager'

export const useFunctions = () => {
  const { keyContracts } = useContracts()
  const { solaceCoverageProduct } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getAvailableCoverCapacity = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.availableCoverCapacity()
      return d
    } catch (e) {
      console.log('error getAvailableCoverCapacity ', e)
      return ZERO
    }
  }

  const getMaxCover = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.maxCover()
      return d
    } catch (e) {
      console.log('error getMaxCover ', e)
      return ZERO
    }
  }

  const getPaused = async (): Promise<boolean> => {
    if (!solaceCoverageProduct) return true
    try {
      const d = await solaceCoverageProduct.paused()
      return d
    } catch (e) {
      console.log('error getPaused ', e)
      return true
    }
  }

  const getActiveCoverLimit = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.activeCoverLimit()
      return d
    } catch (e) {
      console.log('error getActiveCoverLimit ', e)
      return ZERO
    }
  }

  const getPolicyCount = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.policyCount()
      return d
    } catch (e) {
      console.log('error getPolicyCount ', e)
      return ZERO
    }
  }

  const getMaxRateNum = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.maxRateNum()
      return d
    } catch (e) {
      console.log('error getMaxRateNum ', e)
      return ZERO
    }
  }

  const getMaxRateDenom = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.maxRateDenom()
      return d
    } catch (e) {
      console.log('error getMaxRateDenom ', e)
      return ZERO
    }
  }

  const getChargeCycle = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.chargeCycle()
      return d
    } catch (e) {
      console.log('error getChargeCycle ', e)
      return ZERO
    }
  }

  const getCooldownPeriod = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.cooldownPeriod()
      return d
    } catch (e) {
      console.log('error getCooldownPeriod ', e)
      return ZERO
    }
  }

  const getReferralReward = async (): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.referralReward()
      return d
    } catch (e) {
      console.log('error getReferralReward ', e)
      return ZERO
    }
  }

  const getIsReferralOn = async (): Promise<boolean> => {
    if (!solaceCoverageProduct) return true
    try {
      const d = await solaceCoverageProduct.isReferralOn()
      return d
    } catch (e) {
      console.log('error getIsReferralOn ', e)
      return true
    }
  }

  const getPolicyStatus = async (policyId: BigNumber): Promise<boolean> => {
    if (!solaceCoverageProduct) return true
    try {
      const d = await solaceCoverageProduct.policyStatus(policyId)
      return d
    } catch (e) {
      console.log('error getPolicyStatus ', e)
      return true
    }
  }

  const getCoverLimitOf = async (policyId: BigNumber): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.coverLimitOf(policyId)
      return d
    } catch (e) {
      console.log('error getCoverLimitOf ', e)
      return ZERO
    }
  }

  const getIsReferralCodeUsed = async (account: string): Promise<boolean> => {
    if (!solaceCoverageProduct) return true
    try {
      const d = await solaceCoverageProduct.isReferralCodeUsed(account)
      return d
    } catch (e) {
      console.log('error getIsReferralCodeUsed ', e)
      return true
    }
  }

  const getRewardPointsOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.rewardPointsOf(account)
      return d
    } catch (e) {
      console.log('error getRewardPointsOf ', e)
      return ZERO
    }
  }

  const getAccountBalanceOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.accountBalanceOf(account)
      return d
    } catch (e) {
      console.log('error getAccountBalanceOf ', e)
      return ZERO
    }
  }

  const getPolicyOf = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.policyOf(account)
      return d
    } catch (e) {
      console.log('error getPolicyOf ', e)
      return ZERO
    }
  }

  const getCooldownStart = async (account: string): Promise<BigNumber> => {
    if (!solaceCoverageProduct) return ZERO
    try {
      const d = await solaceCoverageProduct.cooldownStart(account)
      return d
    } catch (e) {
      console.log('error getCooldownStart ', e)
      return ZERO
    }
  }

  const activatePolicy = async (account: string, coverLimit: BigNumber, deposit: BigNumber, referralCode: string) => {
    if (!solaceCoverageProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverageProduct.activatePolicy(account, coverLimit, deposit, referralCode, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_ACTIVATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const deactivatePolicy = async () => {
    if (!solaceCoverageProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverageProduct.deactivatePolicy({
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

  const updateCoverLimit = async (newCoverLimit: BigNumber, referralCode: string) => {
    if (!solaceCoverageProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverageProduct.updateCoverLimit(newCoverLimit, referralCode, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOTERIA_UPDATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const deposit = async (account: string, deposit: BigNumber) => {
    if (!solaceCoverageProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverageProduct.deposit(account, deposit, {
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
    if (!solaceCoverageProduct) return { tx: null, localTx: null }
    const tx = await solaceCoverageProduct.withdraw({
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
    getMaxCover,
    getPaused,
    getActiveCoverLimit,
    getPolicyCount,
    getMaxRateNum,
    getMaxRateDenom,
    getChargeCycle,
    getCooldownPeriod,
    getReferralReward,
    getIsReferralOn,
    getPolicyStatus,
    getCoverLimitOf,
    getRewardPointsOf,
    getAccountBalanceOf,
    getPolicyOf,
    getCooldownStart,
    activatePolicy,
    deactivatePolicy,
    updateCoverLimit,
    deposit,
    withdraw,
  }
}

export const usePortfolio = (account: string, chainId: number): SolaceRiskProtocol[] => {
  const [data, setData] = useState<SolaceRiskProtocol[]>([])

  useEffect(() => {
    const getPortfolio = async () => {
      try {
        const balances = await getSolaceRiskBalances(account, chainId)
        const scores = await getSolaceRiskScores(account, balances)
        const protocols = scores.protocols
        setData(protocols)
      } catch (e) {
        console.log('cannot get risk assessment')
      }
    }
    getPortfolio()
  }, [account, chainId])

  return data
}

export const useCheckCooldown = (account: string | undefined) => {
  const { latestBlock } = useProvider()
  const { getCooldownPeriod, getCooldownStart } = useFunctions()

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
    getCooldownAssessment
  }, [account, latestBlock])

  return { isCooldownActive, cooldownStart, cooldownPeriod, cooldownLeft }
}

export const useCheckIsCoverageActive = (account: string | undefined) => {
  const { getPolicyOf, getPolicyStatus, getCoverLimitOf } = useFunctions()
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [status, setStatus] = useState<boolean>(false)
  const [coverageLimit, setCoverageLimit] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const getStatus = async () => {
      if (!account) return
      const policyId = await getPolicyOf(account)
      if (policyId.eq(ZERO)) {
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
    }
    getStatus()
  }, [account])

  return { policyId, status, coverageLimit }
}
