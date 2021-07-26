import { withBackoffRetries } from '../utils/time'
import { rangeFrom0 } from '../utils/numeric'
import { policyConfig } from '../utils/config/chainConfig'
import { useWallet } from '../context/WalletManager'
import { PolicyState } from '../constants/enums'
import { Policy } from '../constants/types'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect, useRef } from 'react'
import { DEFAULT_CHAIN_ID } from '../constants'

export const usePolicyGetter = (
  getAll: boolean,
  latestBlock: number,
  dataInit: boolean,
  version: number,
  policyHolder?: string,
  product?: string
) => {
  const { library, chainId, isActive } = useWallet()
  const { policyManager } = useContracts()
  const [userPolicies, setUserPolicies] = useState<Policy[]>([])
  const [allPolicies, setAllPolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState<boolean>(true)
  const mounting = useRef(true)
  const config = policyConfig[String(chainId ?? DEFAULT_CHAIN_ID)]

  const getUserPolicies = async (policyHolder: string): Promise<Policy[]> => {
    if (!policyManager || !library) return []
    const blockNumber = await library.getBlockNumber()
    const policyIds: BigNumber[] = await policyManager.listPolicies(policyHolder).catch((err: any) => console.log(err))
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
    if (!config || !library) return
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0)
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
    const initializedConfig = policyConfig[String(chainId ?? DEFAULT_CHAIN_ID)]
    policies.forEach((policy: Policy) => {
      const productPosition = initializedConfig.positions[config.productsRev[policy.productAddress] ?? '']
      if (productPosition) {
        policy.positionName = productPosition.positionNames[policy.positionContract.toLowerCase()]
      }
    })
    if (policyHolder) {
      setUserPolicies(policies)
    } else {
      setAllPolicies(policies)
    }
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
        productName: config.productsRev[policy.product] ?? '',
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

  useEffect(() => {
    const loadOverTime = async () => {
      await getPolicies()
    }
    if (policyHolder !== undefined || !library || !getAll || !dataInit) return

    loadOverTime()
  }, [latestBlock, library, dataInit])

  useEffect(() => {
    const loadOnBoot = async () => {
      await getPolicies(policyHolder)
      setPoliciesLoading(false)
      mounting.current = false
    }
    setPoliciesLoading(true)
    if (!policyHolder || !library || getAll || !dataInit) return
    loadOnBoot()
  }, [policyHolder, isActive, library, dataInit])

  useEffect(() => {
    const loadOverTime = async () => {
      await getPolicies(policyHolder)
    }
    if (policyHolder == undefined || mounting.current || getAll || !dataInit) return

    loadOverTime()
  }, [policyHolder, latestBlock, version, dataInit])

  return { policiesLoading, userPolicies, allPolicies }
}
