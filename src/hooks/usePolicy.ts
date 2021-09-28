import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { LiquityPosition, Policy, Position, StringToStringMapping, SupportedProduct, Token } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'
import { getPositions } from '../products/positionGetters/liquity/getPositions'
import { useGasConfig } from './useFetchGasPrice'

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
    getPrice()
  }, [selectedProtocol, policyId, userPolicyData.userPolicies])

  return policyPrice
}

export const useAppraisePosition = (policy: Policy | undefined): BigNumber => {
  const { activeNetwork } = useNetwork()
  const { account, library } = useWallet()
  const { getProtocolByName } = useContracts()
  const { latestBlock, tokenPositionData } = useCachedData()
  const [appraisal, setAppraisal] = useState<BigNumber>(ZERO)

  const handlePositionBalances = async (supportedProduct: SupportedProduct): Promise<BigNumber[]> => {
    const cache = tokenPositionData.storedPositionData.find((dataset) => dataset.name == activeNetwork.name)
    if (!account || !library || !cache || !policy) return []
    switch (supportedProduct.positionsType) {
      case 'erc20':
        const tokensToAppraise: Token[] = []
        policy.positionNames.forEach(async (name) => {
          const positionToAppraise: Position | undefined = cache.positions[supportedProduct.name].savedPositions.find(
            (position: Position) => (position.position as Token).underlying.symbol == name
          )
          if (!positionToAppraise) return
          tokensToAppraise.push(positionToAppraise.position as Token)
        })
        const erc20Balances: BigNumber[] = await supportedProduct.getAppraisals(tokensToAppraise, activeNetwork.chainId)
        return erc20Balances
      case 'liquity':
        const positionsToAppraise: LiquityPosition[] = []
        policy.positionNames.forEach(async (name) => {
          const positionToAppraise: Position | undefined = cache.positions[supportedProduct.name].savedPositions.find(
            (position: Position) => (position.position as LiquityPosition).positionName == name
          )
          if (!positionToAppraise) return
          positionsToAppraise.push(positionToAppraise.position as LiquityPosition)
        })
        const liquityPositions = await getPositions(account, library, activeNetwork, positionsToAppraise)
        const liquityBalances: BigNumber[] = liquityPositions.map((pos) => pos.nativeAmount)

        return liquityBalances
      case 'other':
      default:
        return []
    }
  }

  useEffect(() => {
    const getAppraisal = async () => {
      if (!policy || !tokenPositionData.dataInitialized) return
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
  }, [policy?.policyId, account, tokenPositionData.dataInitialized, latestBlock])

  useEffect(() => {
    // if policy id changes, reset appraisal to 0 to enable loading icon on frontend
    if (!appraisal.eq(ZERO)) setAppraisal(ZERO)
  }, [policy?.policyId])

  return appraisal
}

export const useGetMaxCoverPerPolicy = (): string => {
  const [maxCoverPerPolicy, setMaxCoverPerPolicy] = useState<string>('0')
  const { selectedProtocol, riskManager } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { gasPrices } = useCachedData()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)

  const getMaxCoverPerPolicy = async () => {
    if (!selectedProtocol || !riskManager) return
    try {
      // TODO: entire correct gas params
      const maxCoverPerPolicy = await riskManager.maxCoverPerPolicy(selectedProtocol.address, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
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
  const { products, getProtocolByName, riskManager } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { gasPrices } = useCachedData()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)

  const getYearlyCosts = async () => {
    try {
      if (!products || !riskManager) return
      const newYearlyCosts: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            // TODO: entire correct gas params
            const params = await riskManager.productRiskParams(product.address, {
              ...gasConfig,
              gasLimit: GAS_LIMIT,
            })
            // newYearlyCosts[productContract.name] = formatUnits(fetchedPrice, currencyDecimals)
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
  const { products, getProtocolByName, riskManager } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { gasPrices } = useCachedData()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)

  const getAvailableCoverages = async () => {
    try {
      if (!products || !riskManager) return
      const newAvailableCoverages: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            // TODO: entire correct gas params
            const sellableCoverPerProduct = await riskManager.sellableCoverPerProduct(product.address, {
              ...gasConfig,
              gasLimit: GAS_LIMIT,
            })
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
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)),
        {
          gasLimit: GAS_LIMIT,
        }
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
