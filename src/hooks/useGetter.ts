import { withBackoffRetries, range } from '../utils'
import { policyConfig } from '../config/policyConfig'
import { useWallet } from '../context/WalletManager'
import { PolicyStates } from '../constants/enums'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'

export interface Policy {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionContract: string
  expirationBlock: string
  coverAmount: string
  price: string
  status: PolicyStates
  positionName: string
}

export const usePolicyGetter = () => {
  const wallet = useWallet()
  const { policyManager } = useContracts()

  const getPolicies = async (policyHolder?: string, product?: string) => {
    if (!policyConfig[String(wallet.chainId)]) return []
    await checkInit()
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0)
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
    policies.forEach(
      (policy: any) =>
        (policy.positionName =
          policyConfig[String(wallet.chainId)].positionNames[policy.positionContract.toLowerCase()])
    )
    return policies
  }

  const checkInit = async () => {
    if (!policyConfig[String(wallet.chainId)].initialized) {
      const tokens = policyConfig[String(wallet.chainId)].tokens
      const positionNames = tokens?.reduce(
        (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
        {}
      )
      policyConfig[String(wallet.chainId)] = {
        ...policyConfig[String(wallet.chainId)],
        positionNames,
        initialized: true,
      }
    }
  }

  const getUserPolicies = async (policyHolder: string): Promise<any> => {
    const [blockNumber, policyIds] = await Promise.all([
      wallet.library.getBlockNumber(),
      policyManager?.listPolicies(policyHolder),
    ])
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const getAllPolicies = async (): Promise<any> => {
    const [blockNumber, totalPolicyCount] = await Promise.all([
      wallet.library.getBlockNumber(),
      policyManager?.totalPolicyCount(),
    ])
    const policyIds = range(totalPolicyCount.toNumber())
    const policies = await Promise.all(policyIds.map((policyId) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const queryPolicy = async (policyId: any, blockNumber: any) => {
    try {
      if (!policyManager)
        return {
          policyId: -1,
        }
      const policy = await withBackoffRetries(async () => policyManager.getPolicyInfo(policyId))
      return {
        policyId: Number(policyId),
        policyholder: policy.policyholder,
        productAddress: policy.product,
        productName: policyConfig[String(wallet.chainId)].productsRev[policy.product],
        positionContract: policy.positionContract,
        expirationBlock: policy.expirationBlock.toString(),
        coverAmount: policy.coverAmount.toString(),
        price: policy.price.toString(),
        status: policy.expirationBlock.lt(blockNumber) ? 'Expired' : 'Active',
        positionName: '',
      }
    } catch (err) {
      return {
        policyId: -1,
      }
    }
  }

  return { getPolicies, getUserPolicies, getAllPolicies }
}
