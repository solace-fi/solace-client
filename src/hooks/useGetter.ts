import { withBackoffRetries, rangeFrom1 } from '../utils'
import { policyConfig } from '../config/chainConfig'
import { useWallet } from '../context/WalletManager'
import { PolicyState } from '../constants/enums'
import { Policy } from '../constants/types'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { DEFAULT_CHAIN_ID } from '../constants'

export const usePolicyGetter = () => {
  const wallet = useWallet()
  const { policyManager } = useContracts()
  const config =
    wallet.chainId && policyConfig[String(wallet.chainId)]
      ? policyConfig[String(wallet.chainId)]
      : policyConfig[String(DEFAULT_CHAIN_ID)]

  const getPolicies = async (policyHolder?: string, product?: string) => {
    if (!config) return []
    await checkInit()
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0)
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
    const initializedConfig =
      wallet.chainId && policyConfig[String(wallet.chainId)]
        ? policyConfig[String(wallet.chainId)]
        : policyConfig[String(DEFAULT_CHAIN_ID)]
    policies.forEach(
      (policy: Policy) => (policy.positionName = initializedConfig.positionNames[policy.positionContract.toLowerCase()])
    )
    return policies
  }

  const checkInit = async () => {
    if (!config.initialized) {
      const tokens = await config.getTokens(wallet.library)
      const positionNames = tokens?.reduce(
        (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
        {}
      )
      wallet.chainId && policyConfig[String(wallet.chainId)]
        ? policyConfig[String(wallet.chainId)]
        : (policyConfig[String(DEFAULT_CHAIN_ID)] = {
            ...config,
            positionNames,
            initialized: true,
          })
    }
  }

  const getUserPolicies = async (policyHolder: string): Promise<Policy[]> => {
    const blockNumber = await wallet.library.getBlockNumber()
    const policyIds: BigNumber[] = await policyManager?.listPolicies(policyHolder)
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const getAllPolicies = async (): Promise<Policy[]> => {
    const [blockNumber, totalPolicyCount] = await Promise.all([
      wallet.library.getBlockNumber(),
      policyManager?.totalPolicyCount(),
    ])
    const policyIds = rangeFrom1(totalPolicyCount.toNumber())
    const policies = await Promise.all(policyIds.map((policyId: number) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const queryPolicy = async (policyId: BigNumber | number, blockNumber: number): Promise<Policy> => {
    const returnError = {
      policyId: 0,
      policyHolder: '',
      productAddress: '',
      productName: '',
      positionContract: '',
      expirationBlock: '',
      coverAmount: '',
      price: '',
      status: PolicyState.EXPIRED,
      positionName: '',
    }
    if (!policyManager) return returnError
    try {
      const policy = await withBackoffRetries(async () => policyManager.getPolicyInfo(policyId))
      return {
        policyId: Number(policyId),
        policyHolder: policy.policyholder,
        productAddress: policy.product,
        productName: config.productsRev[policy.product],
        positionContract: policy.positionContract,
        expirationBlock: policy.expirationBlock.toString(),
        coverAmount: policy.coverAmount.toString(),
        price: policy.price.toString(),
        status: policy.expirationBlock.lt(blockNumber) ? PolicyState.EXPIRED : PolicyState.ACTIVE,
        positionName: '',
      }
    } catch (err) {
      return returnError
    }
  }

  return { getPolicies, getUserPolicies, getAllPolicies }
}
