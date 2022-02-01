import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { useGetFunctionGas } from './useGas'

export const useSoteria = () => {
  const { keyContracts } = useContracts()
  const { soteriaCoverageProduct } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getReferralCode = async (account: string): Promise<BigNumber> => {
    if (!soteriaCoverageProduct) return ZERO
    try {
      const referralCode = await soteriaCoverageProduct.getReferralCode(account)
      return referralCode
    } catch (err) {
      console.log('error getReferralCode ', err)
      return ZERO
    }
  }

  const getData = async (): Promise<{
    availableCoverCapacity: BigNumber
    maxCover: BigNumber
    paused: boolean
    activeCoverLimit: BigNumber
    policyCount: BigNumber
    maxRateNum: BigNumber
    maxRateDenom: BigNumber
    chargeCycle: BigNumber
    cooldownPeriod: BigNumber
    referralRewardPercentage: BigNumber
  }> => {
    if (!soteriaCoverageProduct)
      return {
        availableCoverCapacity: ZERO,
        maxCover: ZERO,
        paused: true,
        activeCoverLimit: ZERO,
        policyCount: ZERO,
        maxRateNum: ZERO,
        maxRateDenom: ZERO,
        chargeCycle: ZERO,
        cooldownPeriod: ZERO,
        referralRewardPercentage: ZERO,
      }
    try {
      const [
        availableCoverCapacity,
        maxCover,
        paused,
        activeCoverLimit,
        policyCount,
        maxRateNum,
        maxRateDenom,
        chargeCycle,
        cooldownPeriod,
        referralRewardPercentage,
      ] = await Promise.all([
        await soteriaCoverageProduct.availableCoverCapacity(),
        await soteriaCoverageProduct.maxCover(),
        await soteriaCoverageProduct.paused(),
        await soteriaCoverageProduct.activeCoverLimit(),
        await soteriaCoverageProduct.policyCount(),
        await soteriaCoverageProduct.maxRateNum(),
        await soteriaCoverageProduct.maxRateDenom(),
        await soteriaCoverageProduct.chargeCycle(),
        await soteriaCoverageProduct.cooldownPeriod(),
        await soteriaCoverageProduct.referralRewardPercentage(),
      ])
      return {
        availableCoverCapacity,
        maxCover,
        paused,
        activeCoverLimit,
        policyCount,
        maxRateNum,
        maxRateDenom,
        chargeCycle,
        cooldownPeriod,
        referralRewardPercentage,
      }
    } catch (err) {
      console.log('error getData ', err)
      return {
        availableCoverCapacity: ZERO,
        maxCover: ZERO,
        paused: true,
        activeCoverLimit: ZERO,
        policyCount: ZERO,
        maxRateNum: ZERO,
        maxRateDenom: ZERO,
        chargeCycle: ZERO,
        cooldownPeriod: ZERO,
        referralRewardPercentage: ZERO,
      }
    }
  }

  const getDataByPolicyId = async (policyId: BigNumber): Promise<{ policyStatus: boolean; coverLimit: BigNumber }> => {
    if (!soteriaCoverageProduct) return { policyStatus: false, coverLimit: ZERO }
    try {
      const [policyStatus, coverLimit] = await Promise.all([
        await soteriaCoverageProduct.policyStatus(policyId),
        await soteriaCoverageProduct.coverLimitOf(policyId),
      ])
      return {
        policyStatus,
        coverLimit,
      }
    } catch (err) {
      console.log('error getDataByPolicyId ', err)
      return { policyStatus: false, coverLimit: ZERO }
    }
  }

  const getDataByPolicyHolder = async (
    account: string
  ): Promise<{ rewardPoints: BigNumber; accountBalance: BigNumber; policyId: BigNumber; cooldownStart: BigNumber }> => {
    if (!soteriaCoverageProduct)
      return { rewardPoints: ZERO, accountBalance: ZERO, policyId: ZERO, cooldownStart: ZERO }
    try {
      const [rewardPoints, accountBalance, policyId, cooldownStart] = await Promise.all([
        await soteriaCoverageProduct.rewardPointsOf(account),
        await soteriaCoverageProduct.accountBalanceOf(account),
        await soteriaCoverageProduct.policyOf(account),
        await soteriaCoverageProduct.cooldownStart(account),
      ])
      return {
        rewardPoints,
        accountBalance,
        policyId,
        cooldownStart,
      }
    } catch (err) {
      console.log('error getDataByPolicyHolder ', err)
      return { rewardPoints: ZERO, accountBalance: ZERO, policyId: ZERO, cooldownStart: ZERO }
    }
  }

  const activatePolicy = async (
    account: string,
    coverLimit: BigNumber,
    deposit: BigNumber,
    referralCode: BigNumber
  ) => {
    if (!soteriaCoverageProduct) return { tx: null, localTx: null }
    const tx = await soteriaCoverageProduct.activatePolicy(account, coverLimit, referralCode, {
      value: deposit,
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
    if (!soteriaCoverageProduct) return { tx: null, localTx: null }
    const tx = await soteriaCoverageProduct.deactivatePolicy({
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

  const updateCoverLimit = async (newCoverLimit: BigNumber, referralCode: BigNumber) => {
    if (!soteriaCoverageProduct) return { tx: null, localTx: null }
    const tx = await soteriaCoverageProduct.updateCoverLimit(newCoverLimit, referralCode, {
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

  const deposit = async (deposit: BigNumber) => {
    if (!soteriaCoverageProduct) return { tx: null, localTx: null }
    const tx = await soteriaCoverageProduct.deposit({
      value: deposit,
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

  const withdraw = async (amount: BigNumber) => {
    if (!soteriaCoverageProduct) return { tx: null, localTx: null }
    const tx = await soteriaCoverageProduct.withdraw(amount, {
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
    getReferralCode,
    getData,
    getDataByPolicyHolder,
    getDataByPolicyId,
    activatePolicy,
    deactivatePolicy,
    updateCoverLimit,
    deposit,
    withdraw,
  }
}
