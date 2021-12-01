import { useWallet } from '../context/WalletManager'
import { PolicyState } from '../constants/enums'
import { Policy, SupportedProduct, PositionNamesCacheValue } from '../constants/types'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect, useRef } from 'react'
import { useNetwork } from '../context/NetworkManager'
import { getClaimAssessment } from '../utils/api'
import { trim0x } from '../utils/formatting'
import { useProvider } from '../context/ProviderManager'

export const usePolicyGetter = (
  getAll: boolean,
  policyHolder?: string
): {
  policiesLoading: boolean
  userPolicies: Policy[]
  allPolicies: Policy[]
  setCanGetAssessments: (toggle: boolean) => void
} => {
  const { library } = useWallet()
  const { latestBlock, tokenPosData } = useProvider()
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

  const queryPolicy = async (policyId: BigNumber | number, blockNumber: number): Promise<Policy> => {
    const returnError = {
      policyId: 0,
      policyHolder: '',
      productAddress: '',
      productName: '',
      positionDescription: '',
      positionAddrs: [],
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
      let productName = ''
      if (!getAll && policyHolder) {
        productName = getProductNameFromAddress(policy.product)
      }
      return {
        policyId: Number(policyId),
        policyHolder: policy.policyholder,
        productAddress: policy.product,
        productName: productName,
        positionDescription: policy.positionDescription,
        positionAddrs: [],
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

  const getPolicyPositions = (productPosition: PositionNamesCacheValue | undefined, policy: Policy) => {
    if (productPosition) {
      Object.keys(productPosition.positionNames).forEach((tokenAddress) => {
        if (policy.positionDescription.includes(trim0x(tokenAddress))) {
          policy.positionAddrs = [...policy.positionAddrs, tokenAddress]
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
    return policy
  }

  const getEditedPolicy = async (policy: Policy): Promise<Policy> => {
    const supportedProductName = getProductNameFromAddress(policy.productAddress)
    const supportedProduct = activeNetwork.cache.supportedProducts.find(
      (product) => product.name == supportedProductName
    )
    if (!supportedProduct) return policy
    const matchingCache = await tokenPosData.handleGetCache(supportedProduct)
    const productPosition = matchingCache?.positionNamesCache[supportedProductName]
    return getPolicyPositions(productPosition, policy)
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

  const getPolicies = async (policyHolder?: string) => {
    if (!findNetworkByChainId(chainId) || !library) return
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    try {
      if (policyHolder) {
        policies = policies.filter((policy: any) => policy.productName != '')
        policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
        setUserPolicies(policies)
        setPoliciesLoading(false)

        const supportedProductNames = new Map()
        const supportedProducts: SupportedProduct[] = []
        const supportedProductNamesArray: string[] = []

        for (let i = 0; i < policies.length; i++) {
          const supportedProductName = getProductNameFromAddress(policies[i].productAddress)
          supportedProductNamesArray.push(supportedProductName)
        }

        for (let i = 0; i < policies.length; i++) {
          const supportedProduct = activeNetwork.cache.supportedProducts.find(
            (product) => product.name == supportedProductNamesArray[i]
          )
          if (supportedProduct && supportedProductNames.get(supportedProduct.name) != true) {
            supportedProductNames.set(supportedProduct.name, true)
            supportedProducts.push(supportedProduct)
          }
        }

        const newCache = await tokenPosData.getCacheForPolicies(supportedProducts)

        for (let i = 0; i < policies.length; i++) {
          const productPosition = newCache?.positionNamesCache[supportedProductNamesArray[i]]
          policies[i] = getPolicyPositions(productPosition, policies[i])
        }
        setUserPolicies(policies)
        if (canGetClaimAssessments.current) await fetchClaimAssessments(policies)
      } else {
        setAllPolicies(policies)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getUpdatedUserPolicy = async (id: any) => {
    const belongsToUser = userPoliciesRef.current.find((policy) => policy.policyId == id)
    if (!belongsToUser) return
    const blockNumber = await library.getBlockNumber()
    let updatedPolicy = await queryPolicy(id, blockNumber)
    updatedPolicy = await getEditedPolicy(updatedPolicy)

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

  const getProductNameFromAddress = (addr: string): string => {
    const productNames = Object.keys(activeNetwork.config.productContracts)
    for (let i = 0; i < Object.keys(activeNetwork.config.productContracts).length; i++) {
      if (activeNetwork.config.productContracts[productNames[i]].addr.toLowerCase() == addr.toLowerCase()) {
        return productNames[i]
      }
    }
    return ''
  }

  // load on change of account or network
  useEffect(() => {
    const loadOnBoot = async () => {
      await getPolicies(policyHolder)
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
  }, [policyHolder, policyManager, getUpdatedUserPolicy])

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

  return { policiesLoading, userPolicies, allPolicies, setCanGetAssessments }
}
