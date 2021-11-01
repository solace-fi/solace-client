import { BigNumber } from 'ethers'
import { DEADLINE, GAS_LIMIT } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import { getPermitErc721EnhancedSignature } from '../utils/signature'

export const useSptFarm = () => {
  const { sptFarm, policyManager } = useContracts()
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const depositPolicy = async (
    nftId: BigNumber,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!sptFarm || !policyManager || !nftId || !chainId || !account || !library) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc721EnhancedSignature(
      account,
      chainId,
      library,
      policyManager,
      sptFarm.address,
      nftId,
      DEADLINE
    )
    const tx = await sptFarm.depositPolicySigned(account, nftId, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: 499230,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_POLICY_SIGNED,
      value: `#${nftId.toString()}`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const depositPolicyMulti = async (
    nftIds: BigNumber[],
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!sptFarm || !policyManager || !nftIds || !chainId || !account || !library) return { tx: null, localTx: null }
    const signatures = await Promise.all(
      nftIds.map(
        async (nftId) =>
          await getPermitErc721EnhancedSignature(
            account,
            chainId,
            library,
            policyManager,
            sptFarm.address,
            nftId,
            DEADLINE
          )
      )
    )
    const vArr = signatures.map((s) => s.v)
    const rArr = signatures.map((s) => s.r)
    const sArr = signatures.map((s) => s.s)
    const depositors = nftIds.map((id) => account)
    const deadlines = nftIds.map((id) => DEADLINE)
    const tx = await sptFarm.depositPolicySignedMulti(depositors, nftIds, deadlines, vArr, rArr, sArr, {
      ...gasConfig,
      gasLimit: 990486,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_POLICY_SIGNED_MULTI,
      value: `${nftIds.length} policies`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawPolicy = async (
    nftId: BigNumber,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!sptFarm) return { tx: null, localTx: null }
    const tx = await sptFarm.withdrawPolicy(nftId, {
      ...gasConfig,
      gasLimit: 264795,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_POLICY,
      value: `#${nftId.toString()}`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawPolicyMulti = async (
    nftIds: BigNumber[],
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!sptFarm) return { tx: null, localTx: null }
    const tx = await sptFarm.withdrawPolicy(nftIds, {
      ...gasConfig,
      gasLimit: 271693,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_POLICY_MULTI,
      value: `${nftIds.length} policies`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { depositPolicy, withdrawPolicy, depositPolicyMulti, withdrawPolicyMulti }
}
