import useDebounce from '@rooks/use-debounce'
import { BigNumber, Contract } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useMemo, useState } from 'react'
import { NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import {
  LiquityPosition,
  NetworkConfig,
  Policy,
  Position,
  StringToStringMapping,
  SupportedProduct,
  Token,
} from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'
import { PositionType } from '../constants/enums'
import { useProvider } from '../context/ProviderManager'
import { JsonRpcProvider } from '@ethersproject/providers'
import { isAddress } from '../utils'
import { numberAbbreviate, truncateValue } from '../utils/formatting'
import { useFunctions, useSupportedChains } from './useSolaceCoverProduct'
import { CheckboxData } from '../pages/stake/types/LockCheckbox'

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
  const { activeNetwork } = useNetwork()
  const { account, library } = useWallet()
  const { getProtocolByName } = useContracts()
  const { userPolicyData } = useCachedData()
  const { tokenPosData, latestBlock } = useProvider()
  const [appraisal, setAppraisal] = useState<BigNumber>(ZERO)

  const handlePositionBalances = async (supportedProduct: SupportedProduct): Promise<BigNumber[]> => {
    const matchingCache = await tokenPosData.handleGetCache(supportedProduct)
    if (!account || !library || !matchingCache || !policy) return []
    const cachedPositions = matchingCache.positionsCache[supportedProduct.name].positions
    switch (supportedProduct.positionsType) {
      case PositionType.TOKEN:
        const tokensToAppraise: Token[] = []

        // loop names because we want the only positions included in the policy, not positions cached on boot
        policy.positionNames.forEach(async (name) => {
          // find the position in the cache using the name
          const positionToAppraise = cachedPositions.find(
            (position: Position) => (position.position as Token).token.symbol == name
          )
          if (!positionToAppraise) return

          // add position into array of other positions to get balances of
          tokensToAppraise.push(positionToAppraise.position as Token)
        })
        if (typeof supportedProduct.getBalances !== 'undefined') {
          const erc20Tokens: Token[] = await supportedProduct.getBalances[activeNetwork.chainId](
            account,
            library,
            activeNetwork,
            tokensToAppraise
          ).catch((e) => {
            console.log(`usePolicy: getBalances() for ${supportedProduct.name} failed`, e)
            return []
          })
          return erc20Tokens.map((t) => t.eth.balance)
        }
        return []
      case PositionType.LQTY:
        const positionsToAppraise: LiquityPosition[] = []
        policy.positionNames.forEach(async (name) => {
          const positionToAppraise = cachedPositions.find(
            (position: Position) => (position.position as LiquityPosition).positionName == name
          )
          if (!positionToAppraise) return
          positionsToAppraise.push(positionToAppraise.position as LiquityPosition)
        })
        if (typeof supportedProduct.getPositions !== 'undefined') {
          const liquityPositions = await supportedProduct.getPositions[activeNetwork.chainId](
            account,
            library,
            activeNetwork,
            positionsToAppraise
          ).catch((e: any) => {
            console.log(`usePolicy: getPositions() for ${supportedProduct.name} failed`, e)
            return []
          })
          const liquityBalances: BigNumber[] = liquityPositions.map((pos: LiquityPosition) => pos.nativeAmount)
          return liquityBalances
        }
        return []
      case PositionType.OTHER:
      default:
        return []
    }
  }

  useEffect(() => {
    const getAppraisal = async () => {
      if (!policy || userPolicyData.policiesLoading || !latestBlock) return
      try {
        const product = getProtocolByName(policy.productName)

        // if product is not found or token cache is not found, don't do anything
        if (!product) return
        const supportedProduct = activeNetwork.cache.supportedProducts.find(
          (product) => product.name == policy.productName
        )
        if (!supportedProduct) return

        // grab the user balances for the supported product, then sum them up
        const balances = await handlePositionBalances(supportedProduct)
        setAppraisal(balances.reduce((pv, cv) => pv.add(cv), ZERO))
      } catch (err) {
        console.log('AppraisePosition', err)
      }
    }
    getAppraisal()
  }, [policy?.policyId, account, userPolicyData.policiesLoading, latestBlock])

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
  const { currencyDecimals } = useNetwork()

  const getMaxCoverPerPolicy = async () => {
    if (!selectedProtocol || !riskManager) return
    try {
      const maxCoverPerPolicy = await riskManager.maxCoverPerPolicy(selectedProtocol.address)
      const formattedMaxCover = formatUnits(maxCoverPerPolicy, currencyDecimals)
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
  const { currencyDecimals } = useNetwork()

  const getYearlyCosts = async () => {
    try {
      if (!products || !riskManager) return
      const newYearlyCosts: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const params = await riskManager.productRiskParams(product.address)
            newYearlyCosts[productContract.name] = formatUnits(params.price, currencyDecimals)
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
  const { currencyDecimals } = useNetwork()

  const getAvailableCoverages = async () => {
    try {
      if (!products || !riskManager) return
      const newAvailableCoverages: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const sellableCoverPerProduct = await riskManager.sellableCoverPerProduct(product.address)
            const coverage = formatUnits(sellableCoverPerProduct, currencyDecimals)
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
  const { account } = useWallet()
  const { selectedProtocol } = useContracts()
  const { currencyDecimals } = useNetwork()
  const [quote, setQuote] = useState<string>('0')

  const getQuote = async () => {
    if (!selectedProtocol || !coverAmount) return
    try {
      const positionsQuote: BigNumber = await selectedProtocol.getQuote(
        coverAmount,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days))
      )
      const formattedQuote = formatUnits(positionsQuote, currencyDecimals)
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

export const useTotalActivePolicies = () => {
  const { latestBlock } = useProvider()
  const { networks } = useNetwork()
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const [totalActiveCoverLimit, setTotalActiveCoverLimit] = useState<string>('-')

  useEffect(() => {
    const getPolicyCount = async () => {
      const countedNetworks = networks.filter((n) => !n.isTestnet)
      let totalPolicyCount = ZERO
      let activeCoverLimit = ZERO
      for (let i = 0; i < countedNetworks.length; i++) {
        const activeNetwork = countedNetworks[i]
        if (activeNetwork.config.restrictedFeatures.noSoteria) continue
        const provider = new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
        const solaceCoverProductSrc = activeNetwork.config.keyContracts.solaceCoverProduct
        if (!solaceCoverProductSrc) continue
        if (!solaceCoverProductSrc.addr || !isAddress(solaceCoverProductSrc.addr) || !solaceCoverProductSrc.abi)
          continue
        const solaceCoverProductContract = new Contract(solaceCoverProductSrc.addr, solaceCoverProductSrc.abi, provider)
        const policyCount = await solaceCoverProductContract.policyCount()
        const coverLimit = await solaceCoverProductContract.activeCoverLimit()
        activeCoverLimit = activeCoverLimit.add(coverLimit)
        totalPolicyCount = totalPolicyCount.add(policyCount)
      }
      setTotalActivePolicies(numberAbbreviate(totalPolicyCount.toString()))
      setTotalActiveCoverLimit(truncateValue(formatUnits(activeCoverLimit, 18), 2))
    }
    getPolicyCount()
  }, [latestBlock])

  return { totalActivePolicies, totalActiveCoverLimit }
}

export const useExistingPolicy = (account: string | undefined) => {
  const { networks } = useNetwork()
  const { latestBlock } = useProvider()
  const [loading, setLoading] = useState(true)
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [network, setNetwork] = useState<NetworkConfig>(networks[0])

  useEffect(() => {
    const getExistingPolicy = async () => {
      if (!account) {
        setPolicyId(ZERO)
        setLoading(true)
      }
      const countedNetworks = networks.filter((n) => !n.isTestnet)
      // const countedNetworks = networks
      let _id = ZERO
      let _network = networks[0]
      for (let i = 0; i < countedNetworks.length; i++) {
        const activeNetwork = countedNetworks[i]
        if (activeNetwork.config.restrictedFeatures.noSoteria) continue
        const provider = new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
        const solaceCoverProductSrc = activeNetwork.config.keyContracts.solaceCoverProduct
        if (!solaceCoverProductSrc) continue
        if (!solaceCoverProductSrc.addr || !isAddress(solaceCoverProductSrc.addr) || !solaceCoverProductSrc.abi)
          continue
        const solaceCoverProductContract = new Contract(solaceCoverProductSrc.addr, solaceCoverProductSrc.abi, provider)
        const _policyId = await solaceCoverProductContract.policyOf(account)
        _id = _policyId
        _network = activeNetwork
        if (_id.gt(ZERO)) break
      }
      setNetwork(_network)
      setPolicyId(_id)
      setLoading(false)
    }
    getExistingPolicy()
  }, [account, latestBlock, networks])

  useEffect(() => {
    setLoading(true)
  }, [account])

  return { policyId, network, loading }
}

export const useGetPolicyChains = (policyId: number | undefined) => {
  const { keyContracts } = useContracts()
  const { activeNetwork } = useNetwork()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { getPolicyChainInfo } = useFunctions()
  const { coverableNetworks, coverableChains } = useSupportedChains()

  const [portfolioChains, setPortfolioChains] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [policyChainsChecked, setPolicyChainsChecked] = useState<CheckboxData[]>([])
  const [chainsChecked, setChainsChecked] = useState<CheckboxData[]>([])

  const updateBoxChecked = (chains: CheckboxData[], oldArray: CheckboxData[]): CheckboxData[] => {
    if (oldArray.length === 0) return chains
    return chains.map((chain) => {
      const oldBox = oldArray.find((oldBox) => oldBox.id.eq(chain.id))
      return oldBox ? { id: chain.id, checked: oldBox.checked } : { id: chain.id, checked: false }
    })
  }

  const getPolicyChains = async (_policyId: number, _coverableChains: BigNumber[], shouldUpdateBoxchecked: boolean) => {
    if (activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' && _coverableChains.length == 0) {
      console.log('is v2 but no general chain info returned')
      return
    }
    const _policyChains = await getPolicyChainInfo(BigNumber.from(_policyId))

    /* 
      if there are no chains from this policy, return portfolio for all chains
      else, return portfolio for chains from this policy
    */
    if (_policyChains.length > 0) {
      setPortfolioChains(_policyChains.map((c) => c.toNumber()))
    } else {
      setPortfolioChains(_coverableChains.map((c) => c.toNumber()))
    }

    const numPolicyChains = _policyChains.map((c) => c.toNumber())
    const newArr = _coverableChains.map((c) => {
      if (numPolicyChains.includes(c.toNumber()) || numPolicyChains.length == 0) return { id: c, checked: true }
      return { id: c, checked: false }
    })
    setPolicyChainsChecked(newArr)
    if (shouldUpdateBoxchecked) {
      setChainsChecked(updateBoxChecked(newArr, chainsChecked))
    } else {
      setChainsChecked(newArr)
    }
    setLoading(false)
  }

  // Should run based on whether the user has a policy or not
  useEffect(() => {
    if (policyId == undefined) {
      return
    }
    getPolicyChains(policyId, coverableChains, true)
  }, [policyId, coverableChains.length])

  /* 
    Should run when the user makes a change with their policy
    that should be reflected on the display
  */
  useEffect(() => {
    if (!solaceCoverProduct || policyId == undefined) return
    solaceCoverProduct.on('PolicyUpdated', async (id) => {
      if (BigNumber.from(policyId).eq(id)) getPolicyChains(id, coverableChains, false)
    })
    return () => {
      solaceCoverProduct.removeAllListeners()
    }
  }, [solaceCoverProduct, policyId, coverableChains])

  return {
    portfolioChains,
    policyChainsChecked,
    coverableNetworks,
    chainsChecked,
    setChainsChecked,
    loading,
  }
}
