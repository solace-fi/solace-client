import { useWallet } from '../context/WalletManager'
import { PolicyState } from '../constants/enums'
import { Policy, NetworkCache } from '../constants/types'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect, useRef } from 'react'
import { useNetwork } from '../context/NetworkManager'
import { getClaimAssessment } from '../utils/api'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { trim0x } from '../utils/formatting'

export const usePolicyGetter = (
  getAll: boolean,
  latestBlock: Block | undefined,
  data: {
    dataInitialized: boolean
    storedPosData: NetworkCache[]
  },
  policyHolder?: string,
  product?: string
): {
  policiesLoading: boolean
  userPolicies: Policy[]
  allPolicies: Policy[]
  setCanGetAssessments: (toggle: boolean) => void
} => {
  const { library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { policyManager } = useContracts()
  const [userPolicies, setUserPolicies] = useState<Policy[]>([])
  const [allPolicies, setAllPolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState<boolean>(true)
  const canGetClaimAssessments = useRef(true)
  const userPoliciesRef = useRef(userPolicies)
  const firstLoading = useRef(true)

  const setCanGetAssessments = (toggle: boolean) => {
    canGetClaimAssessments.current = toggle
  }

  const getUserPolicies = async (policyHolder: string): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const [policyIds, blockNumber] = await Promise.all([
      policyManager.listTokensOfOwner(policyHolder),
      library.getBlockNumber(),
    ])
    const totalPolicyIds: BigNumber[] = policyIds
    const policies = await Promise.all(totalPolicyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const getAllPolicies = async (): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const blockNumber = await library.getBlockNumber()
    const policyIds: BigNumber[] = await policyManager.listTokens()
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const getPolicies = async (policyHolder?: string, product?: string) => {
    if (!findNetworkByChainId(chainId) || !library) return
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0 && policy.productName != '')
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    try {
      if (policyHolder) {
        policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
        const matchingCache = data.storedPosData.find((dataset) => dataset.chainId == activeNetwork.chainId)
        policies.forEach(async (policy: Policy) => {
          const supportedProductName = activeNetwork.config.productsRev[policy.productAddress]
          const productPosition = matchingCache?.positionNamesCache[supportedProductName]
          if (productPosition) {
            Object.keys(productPosition.positionNames).forEach((tokenAddress) => {
              if (policy.positionDescription.includes(trim0x(tokenAddress))) {
                policy.positionNames = [...policy.positionNames, productPosition.positionNames[tokenAddress]]
                const newUnderlyingPositionNames = [
                  ...policy.underlyingPositionNames,
                  ...productPosition.underlyingPositionNames[tokenAddress],
                ]
                policy.underlyingPositionNames = newUnderlyingPositionNames.filter(
                  (item: string, index: number) => newUnderlyingPositionNames.indexOf(item) == index
                )
              }
            })
          }
        })
        if (canGetClaimAssessments.current) {
          await fetchClaimAssessments(policies)
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
      underlyingPositionNames: [],
      expirationBlock: 0,
      coverAmount: '',
      price: '',
      status: PolicyState.EXPIRED,
    }
    if (!policyManager) return returnError
    try {
      const policy = await policyManager.getPolicyInfo(policyId)
      return {
        policyId: Number(policyId),
        policyHolder: policy.policyholder,
        productAddress: policy.product,
        productName: activeNetwork.config.productsRev[policy.product] ?? '',
        positionDescription: policy.positionDescription,
        positionNames: [],
        underlyingPositionNames: [],
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
    const matchingCache = data.storedPosData.find((dataset) => dataset.chainId == activeNetwork.chainId)
    const productPosition =
      matchingCache?.positionNamesCache[activeNetwork.config.productsRev[updatedPolicy.productAddress]]
    if (productPosition) {
      Object.keys(productPosition.positionNames).forEach((tokenAddress) => {
        if (updatedPolicy.positionDescription.includes(trim0x(tokenAddress))) {
          updatedPolicy.positionNames = [...updatedPolicy.positionNames, productPosition.positionNames[tokenAddress]]
          const newUnderlyingPositionNames = [
            ...updatedPolicy.underlyingPositionNames,
            ...productPosition.underlyingPositionNames[tokenAddress],
          ]
          updatedPolicy.underlyingPositionNames = newUnderlyingPositionNames.filter(
            (item: string, index: number) => newUnderlyingPositionNames.indexOf(item) == index
          )
        }
      })
    }
    if (canGetClaimAssessments.current) {
      const assessment = await getClaimAssessment(String(updatedPolicy.policyId), activeNetwork.chainId).catch(
        (err) => {
          console.log(err)
          return undefined
        }
      )
      updatedPolicy.claimAssessment = assessment
    }
    const updatedPolicies = userPoliciesRef.current.map((oldPolicy) =>
      oldPolicy.policyId == updatedPolicy.policyId ? updatedPolicy : oldPolicy
    )
    setUserPolicies(updatedPolicies)
  }

  const fetchClaimAssessments = async (policies: Policy[]) => {
    const claimAssessments = await Promise.all(
      policies.map(async (policy) =>
        getClaimAssessment(String(policy.policyId), chainId).catch((err) => {
          console.log(err)
          return undefined
        })
      )
    )
    const policiesWithClaimAssessments = policies.map((policy, i) => {
      return { ...policy, claimAssessment: claimAssessments[i] }
    })
    setUserPolicies(policiesWithClaimAssessments)
  }

  useEffect(() => {
    const loadOnBoot = async () => {
      await getPolicies(policyHolder)
      setPoliciesLoading(false)
    }
    if (policyHolder == undefined || getAll) return
    if (firstLoading.current) {
      setPoliciesLoading(true)
      firstLoading.current = false
    }

    if (!policyManager) return
    loadOnBoot()

    policyManager.on('Transfer', async (from, to) => {
      if (from == policyHolder || to == policyHolder) {
        await getPolicies(policyHolder)
      }
    })

    policyManager.on('PolicyUpdated', async (id) => {
      await getUpdatedUserPolicy(id)
    })

    return () => {
      policyManager.removeAllListeners()
    }
  }, [policyHolder, data.dataInitialized, policyManager])

  /* fetch all policies per block */
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

  /* fetch claim assessments for user policies per block */
  useEffect(() => {
    if (userPolicies.length <= 0 || policiesLoading || !canGetClaimAssessments.current) return
    fetchClaimAssessments(userPolicies)
  }, [latestBlock])

  return { policiesLoading, userPolicies, allPolicies, setCanGetAssessments }
}
