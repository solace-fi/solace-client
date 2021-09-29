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
  data: { dataInitialized: boolean; storedPositionData: NetworkCache[] },
  policyHolder?: string,
  product?: string
) => {
  const { library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { policyManager } = useContracts()
  const [userPolicies, setUserPolicies] = useState<Policy[]>([])
  const [allPolicies, setAllPolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState<boolean>(true)
  const canGetClaimAssessments = useRef(true)
  const userPoliciesRef = useRef(userPolicies)

  const setCanGetAssessments = (toggle: boolean) => {
    canGetClaimAssessments.current = toggle
  }

  const getUserPolicies = async (policyHolder: string): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const blockNumber = await library.getBlockNumber()
    const policyIds: BigNumber[] = await policyManager.listPolicies(policyHolder).catch((err: any) => {
      console.log(err)
      return []
    })
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
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
    const policies = await Promise.all(policyIds.map((policyId: number) => queryPolicy(policyId, blockNumber)))
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
        const matchingCache = data.storedPositionData.find((dataset) => dataset.name == activeNetwork.name)
        policies.forEach((policy: Policy) => {
          const productPosition =
            matchingCache?.positionNames[activeNetwork.config.productsRev[policy.productAddress] ?? '']
          if (productPosition) {
            Object.keys(productPosition.positionNames).forEach((key) => {
              if (policy.positionDescription.includes(key.slice(2))) {
                policy.positionNames.push(productPosition.positionNames[key])
              }
            })
          }
        })
        if (canGetClaimAssessments.current) {
          const claimAssessments = await Promise.all(
            policies.map(async (policy) => getClaimAssessment(String(policy.policyId), chainId))
          )
          const policiesWithClaimAssessments = policies.map((policy, i) => {
            return { ...policy, claimAssessment: claimAssessments[i] }
          })
          setUserPolicies(policiesWithClaimAssessments)
        } else {
          setUserPolicies(policies)
        }
      } else {
        setAllPolicies(policies)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const queryPolicy = async (policyId: BigNumber | number, blockNumber: number): Promise<Policy> => {
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
        claimAssessment: undefined,
      }
    } catch (err) {
      console.log(err)
      return returnError
    }
  }

  const getUpdatedUserPolicy = async (id: any) => {
    const belongsToUser = userPoliciesRef.current.find((policy) => policy.policyId == id)
    if (!belongsToUser) return
    const blockNumber = await library.getBlockNumber()
    const updatedPolicy = await queryPolicy(id, blockNumber)
    const matchingCache = data.storedPositionData.find((dataset) => dataset.name == activeNetwork.name)
    const productPosition =
      matchingCache?.positionNames[activeNetwork.config.productsRev[updatedPolicy.productAddress] ?? '']
    if (productPosition) {
      Object.keys(productPosition.positionNames).forEach((key) => {
        if (updatedPolicy.positionDescription.includes(key.slice(2))) {
          updatedPolicy.positionNames.push(productPosition.positionNames[key])
        }
      })
    }
    if (canGetClaimAssessments.current) {
      const assessment = await getClaimAssessment(String(updatedPolicy.policyId), activeNetwork.chainId)
      updatedPolicy.claimAssessment = assessment
    }
    const updatedPolicies = userPoliciesRef.current.map((oldPolicy) =>
      oldPolicy.policyId == updatedPolicy.policyId ? updatedPolicy : oldPolicy
    )
    setUserPolicies(updatedPolicies)
  }

  useEffect(() => {
    const loadOnBoot = async () => {
      await getPolicies(policyHolder)
      setPoliciesLoading(false)
    }
    if (policyHolder == undefined || getAll) return
    setPoliciesLoading(true)

    if (!data.dataInitialized) return
    loadOnBoot()

    policyManager?.on('Transfer', async (from, to) => {
      if (from == policyHolder || to == policyHolder) {
        await getPolicies(policyHolder)
      }
    })

    policyManager?.on('PolicyUpdated', async (id) => {
      await getUpdatedUserPolicy(id)
    })

    return () => {
      policyManager?.removeAllListeners()
    }
  }, [policyHolder, data.dataInitialized])

  useEffect(() => {
    const loadOverTime = async () => {
      await getPolicies()
    }
    if (policyHolder !== undefined || !getAll) return
    loadOverTime()
  }, [latestBlock])

  useEffect(() => {
    if (policyHolder == undefined || getAll) return
    userPoliciesRef.current = userPolicies
  }, [userPolicies])

  useEffect(() => {
    const getClaimAssessments = async () => {
      const claimAssessments = await Promise.all(
        userPolicies.map(async (policy) => getClaimAssessment(String(policy.policyId), chainId))
      )
      const policiesWithClaimAssessments = userPolicies.map((policy, i) => {
        return { ...policy, claimAssessment: claimAssessments[i] }
      })
      setUserPolicies(policiesWithClaimAssessments)
    }
    if (userPolicies.length <= 0 || policiesLoading || !canGetClaimAssessments.current) return
    getClaimAssessments()
  }, [latestBlock])

  return { policiesLoading, userPolicies, allPolicies, setCanGetAssessments }
}
