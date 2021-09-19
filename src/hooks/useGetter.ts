import { withBackoffRetries } from '../utils/time'
import { rangeFrom0 } from '../utils/numeric'
import { useWallet } from '../context/WalletManager'
import { PolicyState } from '../constants/enums'
import { Policy, NetworkCache } from '../constants/types'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect, useRef } from 'react'
import { useNetwork } from '../context/NetworkManager'
import { getClaimAssessment } from '../utils/paclas'

export const usePolicyGetter = (
  getAll: boolean,
  latestBlock: number,
  data: { dataInitialized: boolean; storedTokenAndPositionData: NetworkCache[] },
  version: number,
  policyHolder?: string,
  product?: string
) => {
  const { library, isActive } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { policyManager } = useContracts()
  const [userPolicies, setUserPolicies] = useState<Policy[]>([])
  const [allPolicies, setAllPolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState<boolean>(true)
  const mounting = useRef(true)

  const getUserPolicies = async (policyHolder: string): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const blockNumber = await library.getBlockNumber()
    const policyIds: BigNumber[] = await policyManager.listPolicies(policyHolder).catch((err: any) => {
      console.log(err)
      return []
    })
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber, true)))
    return policies
  }

  const getAllPolicies = async (): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const [blockNumber, totalSupply] = await Promise.all([
      library.getBlockNumber(),
      policyManager.totalSupply().catch((err: any) => {
        console.log(err)
        return 0
      }),
    ])
    const indices = rangeFrom0(totalSupply)
    const policyIds = await Promise.all(indices.map((index) => policyManager.tokenByIndex(index)))
    const policies = await Promise.all(policyIds.map((policyId: number) => queryPolicy(policyId, blockNumber, false)))
    return policies
  }

  const getPolicies = async (policyHolder?: string, product?: string) => {
    if (!findNetworkByChainId(chainId) || !library) return
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0)
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    try {
      if (policyHolder) {
        policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
        const matchingCache = data.storedTokenAndPositionData.find((dataset) => dataset.name == activeNetwork.name)
        policies.forEach((policy: Policy) => {
          const productPosition =
            matchingCache?.positions[activeNetwork.config.productsRev[policy.productAddress] ?? '']
          if (productPosition) {
            Object.keys(productPosition.positionNames).forEach((key) => {
              if (policy.positionDescription.includes(key.slice(2))) {
                policy.positionNames.push(productPosition.positionNames[key])
              }
            })
          }
        })
        setUserPolicies(policies)
      } else {
        setAllPolicies(policies)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const queryPolicy = async (
    policyId: BigNumber | number,
    blockNumber: number,
    canGetClaimAssessment: boolean
  ): Promise<Policy> => {
    const returnError = {
      policyId: 0,
      policyHolder: '',
      productAddress: '',
      productName: '',
      positionDescription: '',
      positionNames: [],
      expirationBlock: 0,
      coverAmount: '',
      price: '',
      status: PolicyState.EXPIRED,
    }
    if (!policyManager) return returnError
    try {
      const policy = await withBackoffRetries(async () => policyManager.getPolicyInfo(policyId))
      const assessment = canGetClaimAssessment ? await getClaimAssessment(String(policyId), chainId) : undefined
      return {
        policyId: Number(policyId),
        policyHolder: policy.policyholder,
        productAddress: policy.product,
        productName: activeNetwork.config.productsRev[policy.product] ?? '',
        positionDescription: policy.positionDescription,
        positionNames: [],
        expirationBlock: policy.expirationBlock,
        coverAmount: policy.coverAmount.toString(),
        price: policy.price.toString(),
        status: policy.expirationBlock < blockNumber ? PolicyState.EXPIRED : PolicyState.ACTIVE,
        claimAssessment: assessment,
      }
    } catch (err) {
      console.log(err)
      return returnError
    }
  }

  useEffect(() => {
    const loadOverTime = async () => {
      await getPolicies()
    }
    if (policyHolder !== undefined || !library || !getAll) return

    loadOverTime()
  }, [latestBlock])

  useEffect(() => {
    const loadOnBoot = async () => {
      await getPolicies(policyHolder)
      setPoliciesLoading(false)
      mounting.current = false
    }
    setPoliciesLoading(true)
    if (!policyHolder || !library || getAll || !data.dataInitialized) return
    loadOnBoot()
  }, [policyHolder, isActive, activeNetwork, data.dataInitialized])

  useEffect(() => {
    const loadOverTime = async () => {
      await getPolicies(policyHolder)
    }
    if (policyHolder == undefined || mounting.current || getAll || !data.dataInitialized) return

    loadOverTime()
  }, [latestBlock, version])

  return { policiesLoading, userPolicies, allPolicies }
}
