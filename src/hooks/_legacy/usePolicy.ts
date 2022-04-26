import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useMemo, useState } from 'react'
import { NUM_BLOCKS_PER_DAY, ZERO } from '../../constants'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import {
  LiquityPosition,
  Policy,
  Position,
  StringToStringMapping,
  SupportedProduct,
  Token,
} from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { PositionType } from '../../constants/enums'
import { useProvider } from '../../context/ProviderManager'
import { withBackoffRetries } from '../../utils/time'
import { useWeb3React } from '@web3-react/core'

export const useGetPolicyPrice = (policyId: number): string => {
  const [policyPrice, setPolicyPrice] = useState<string>('')
  const { selectedProtocol } = useContracts()
  const { userPolicyData } = useCachedData()

  const getPrice = async () => {
    if (!selectedProtocol || policyId == 0) return
    try {
      const policy = userPolicyData.userPolicies.filter((policy: Policy) => policy.policyId == policyId)[0]
      if (!policy) return
      setPolicyPrice(policy.price)
    } catch (err) {
      console.log('getPolicyPrice', err)
    }
  }

  useEffect(() => {
    if (userPolicyData.policiesLoading) return
    getPrice()
  }, [selectedProtocol, policyId, userPolicyData.policiesLoading])

  return policyPrice
}

export const useAppraisePolicyPosition = (policy: Policy | undefined): BigNumber => {
  // const { activeNetwork } = useNetwork()
  // const { account } = useWeb3React()
  // const { library, latestBlock } = useProvider()
  // const { getProtocolByName } = useContracts()
  // const { userPolicyData } = useCachedData()
  const [appraisal, setAppraisal] = useState<BigNumber>(ZERO)

  // const handlePositionBalances = async (supportedProduct: SupportedProduct): Promise<BigNumber[]> => {
  //   const matchingCache = await tokenPosData.handleGetCache(supportedProduct)
  //   if (!account || !library || !matchingCache || !policy) return []
  //   const cachedPositions = matchingCache.positionsCache[supportedProduct.name].positions
  //   switch (supportedProduct.positionsType) {
  //     case PositionType.TOKEN:
  //       const tokensToAppraise: Token[] = []

  //       // loop names because we want the only positions included in the policy, not positions cached on boot
  //       policy.positionNames.forEach(async (name) => {
  //         // find the position in the cache using the name
  //         const positionToAppraise = cachedPositions.find(
  //           (position: Position) => (position.position as Token).token.symbol == name
  //         )
  //         if (!positionToAppraise) return

  //         // add position into array of other positions to get balances of
  //         tokensToAppraise.push(positionToAppraise.position as Token)
  //       })
  //       if (typeof supportedProduct.getBalances !== 'undefined') {
  //         const erc20Tokens: Token[] = await supportedProduct.getBalances[activeNetwork.chainId](
  //           account,
  //           library,
  //           activeNetwork,
  //           tokensToAppraise
  //         ).catch((e) => {
  //           console.log(`usePolicy: getBalances() for ${supportedProduct.name} failed`, e)
  //           return []
  //         })
  //         return erc20Tokens.map((t) => t.eth.balance)
  //       }
  //       return []
  //     case PositionType.LQTY:
  //       const positionsToAppraise: LiquityPosition[] = []
  //       policy.positionNames.forEach(async (name) => {
  //         const positionToAppraise = cachedPositions.find(
  //           (position: Position) => (position.position as LiquityPosition).positionName == name
  //         )
  //         if (!positionToAppraise) return
  //         positionsToAppraise.push(positionToAppraise.position as LiquityPosition)
  //       })
  //       if (typeof supportedProduct.getPositions !== 'undefined') {
  //         const liquityPositions = await supportedProduct.getPositions[activeNetwork.chainId](
  //           account,
  //           library,
  //           activeNetwork,
  //           positionsToAppraise
  //         ).catch((e: any) => {
  //           console.log(`usePolicy: getPositions() for ${supportedProduct.name} failed`, e)
  //           return []
  //         })
  //         const liquityBalances: BigNumber[] = liquityPositions.map((pos: LiquityPosition) => pos.nativeAmount)
  //         return liquityBalances
  //       }
  //       return []
  //     case PositionType.OTHER:
  //     default:
  //       return []
  //   }
  // }

  // useEffect(() => {
  //   const getAppraisal = async () => {
  //     if (!policy || userPolicyData.policiesLoading || !latestBlock) return
  //     try {
  //       const product = getProtocolByName(policy.productName)

  //       // if product is not found or token cache is not found, don't do anything
  //       if (!product) return
  //       const supportedProduct = activeNetwork.cache.supportedProducts.find(
  //         (product) => product.name == policy.productName
  //       )
  //       if (!supportedProduct) return

  //       // grab the user balances for the supported product, then sum them up
  //       const balances = await handlePositionBalances(supportedProduct)
  //       setAppraisal(balances.reduce((pv, cv) => pv.add(cv), ZERO))
  //     } catch (err) {
  //       console.log('AppraisePosition', err)
  //     }
  //   }
  //   getAppraisal()
  // }, [policy?.policyId, account, userPolicyData.policiesLoading, latestBlock])

  useEffect(() => {
    // if policy id changes, reset appraisal to 0 to enable loading icon on frontend
    if (!appraisal.isZero()) setAppraisal(ZERO)
  }, [policy?.policyId])

  return appraisal
}

export const useGetMaxCoverPerPolicy = (): string => {
  const [maxCoverPerPolicy, setMaxCoverPerPolicy] = useState<string>('0')
  const { selectedProtocol, keyContracts } = useContracts()
  const { riskManager } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()

  const getMaxCoverPerPolicy = async () => {
    if (!selectedProtocol || !riskManager) return
    try {
      const maxCoverPerPolicy = await withBackoffRetries(async () =>
        riskManager.maxCoverPerPolicy(selectedProtocol.address)
      )
      const formattedMaxCover = formatUnits(maxCoverPerPolicy, activeNetwork.nativeCurrency.decimals)
      setMaxCoverPerPolicy(formattedMaxCover)
    } catch (err) {
      console.log('getMaxCoverPerPolicy', err)
    }
  }

  useEffect(() => {
    getMaxCoverPerPolicy()
  }, [selectedProtocol, riskManager])

  return maxCoverPerPolicy
}

export const useGetYearlyCosts = (): StringToStringMapping => {
  const [yearlyCosts, setYearlyCosts] = useState<StringToStringMapping>({})
  const { products, getProtocolByName, keyContracts } = useContracts()
  const { riskManager } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()

  const getYearlyCosts = async () => {
    try {
      if (!products || !riskManager) return
      const newYearlyCosts: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const params = await withBackoffRetries(async () => riskManager.productRiskParams(product.address))
            newYearlyCosts[productContract.name] = formatUnits(params.price, activeNetwork.nativeCurrency.decimals)
          } else {
            newYearlyCosts[productContract.name] = '0'
          }
        })
      )
      setYearlyCosts(newYearlyCosts)
    } catch (err) {
      console.log('getYearlyCost', err)
    }
  }

  useEffect(() => {
    getYearlyCosts()
  }, [products, riskManager])

  return yearlyCosts
}

export const useGetAvailableCoverages = (): StringToStringMapping => {
  const [availableCoverages, setAvailableCoverages] = useState<StringToStringMapping>({})
  const { products, getProtocolByName, keyContracts } = useContracts()
  const { riskManager } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()

  const getAvailableCoverages = async () => {
    try {
      if (!products || !riskManager) return
      const newAvailableCoverages: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const sellableCoverPerProduct = await withBackoffRetries(async () =>
              riskManager.sellableCoverPerProduct(product.address)
            )
            const coverage = formatUnits(sellableCoverPerProduct, activeNetwork.nativeCurrency.decimals)
            newAvailableCoverages[productContract.name] = coverage
          } else {
            newAvailableCoverages[productContract.name] = '0'
          }
        })
      )
      setAvailableCoverages(newAvailableCoverages)
    } catch (err) {
      console.log('getAvailableCoverage', err)
    }
  }

  useEffect(() => {
    getAvailableCoverages()
  }, [products, riskManager])

  return availableCoverages
}

export const useGetQuote = (coverAmount: string | null, days: string): string => {
  const { account } = useWeb3React()
  const { selectedProtocol } = useContracts()
  const { activeNetwork } = useNetwork()
  const [quote, setQuote] = useState<string>('0')

  const getQuote = async () => {
    if (!selectedProtocol || !coverAmount) return
    try {
      const positionsQuote: BigNumber = await withBackoffRetries(async () =>
        selectedProtocol.getQuote(coverAmount, BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)))
      )
      const formattedQuote = formatUnits(positionsQuote, activeNetwork.nativeCurrency.decimals)
      setQuote(formattedQuote)
    } catch (err) {
      console.log('getQuote', err)
    }
  }

  const handleQuote = useDebounce(() => {
    getQuote()
  }, 300)

  useEffect(() => {
    handleQuote()
  }, [coverAmount, selectedProtocol, account, days])

  return quote
}
