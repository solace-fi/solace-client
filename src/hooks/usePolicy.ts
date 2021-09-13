import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { Policy, StringToStringMapping, Token } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'

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

  useEffect(() => {
    const getAppraisal = async () => {
      if (!policy || !library || !account || !tokenPositionData.dataInitialized) return
      try {
        const product = getProtocolByName(policy.productName)
        const cache = tokenPositionData.storedTokenAndPositionData.find((dataset) => dataset.name == activeNetwork.name)

        // if product is not found or token cache is not found, don't do anything
        if (!product || !cache) return
        const supportedProduct = activeNetwork.cache.supportedProducts.find(
          (product) => product.name == policy.productName
        )
        if (!supportedProduct) return

        // grab the user balances for the supported product
        const tokenToAppraise: Token | undefined = cache.tokens[supportedProduct.name].savedTokens.find(
          (token: Token) => token.token.address == policy.positionContract
        )
        if (!tokenToAppraise) return
        const [token]: Token[] = await supportedProduct.getBalances(account, library, cache, activeNetwork, [
          tokenToAppraise,
        ])
        setAppraisal(token.eth.balance)
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

export const useGetMaxCoverPerUser = (): string => {
  const [maxCoverPerUser, setMaxCoverPerUser] = useState<string>('0')
  const { selectedProtocol } = useContracts()
  const { currencyDecimals } = useNetwork()

  const getMaxCoverPerUser = async () => {
    if (!selectedProtocol) return
    try {
      const maxCover = await selectedProtocol.maxCoverPerUser()
      const formattedMaxCover = formatUnits(maxCover, currencyDecimals)
      setMaxCoverPerUser(formattedMaxCover)
    } catch (err) {
      console.log('getMaxCoverPerUser', err)
    }
  }

  useEffect(() => {
    getMaxCoverPerUser()
  }, [selectedProtocol])

  return maxCoverPerUser
}

export const useGetYearlyCosts = (): StringToStringMapping => {
  const [yearlyCosts, setYearlyCosts] = useState<StringToStringMapping>({})
  const { products, getProtocolByName } = useContracts()
  const { currencyDecimals } = useNetwork()

  const getYearlyCosts = async () => {
    try {
      if (!products) return
      const newYearlyCosts: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const fetchedPrice = await product.price()
            newYearlyCosts[productContract.name] = formatUnits(fetchedPrice, currencyDecimals)
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
  }, [products])

  return yearlyCosts
}

export const useGetAvailableCoverages = (): StringToStringMapping => {
  const [availableCoverages, setAvailableCoverages] = useState<StringToStringMapping>({})
  const { products, getProtocolByName } = useContracts()
  const { currencyDecimals } = useNetwork()

  const getAvailableCoverages = async () => {
    try {
      if (!products) return
      const newAvailableCoverages: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const maxCoverAmount = await product.maxCoverAmount()
            const activeCoverAmount = await product.activeCoverAmount()
            const coverage = formatUnits(maxCoverAmount.sub(activeCoverAmount), currencyDecimals)
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
  }, [products])

  return availableCoverages
}

export const useGetQuote = (coverAmount: string | null, positionContract: string | null, days: string): string => {
  const { account } = useWallet()
  const [quote, setQuote] = useState<string>('0')
  const { selectedProtocol } = useContracts()
  const { currencyDecimals } = useNetwork()

  const getQuote = async () => {
    if (!selectedProtocol || !coverAmount || !positionContract) return
    try {
      const quote = await selectedProtocol.getQuote(
        account,
        positionContract,
        coverAmount,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)),
        {
          gasLimit: GAS_LIMIT,
        }
      )
      const formattedQuote = formatUnits(quote, currencyDecimals)
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
  }, [coverAmount, selectedProtocol, account, positionContract, days])

  return quote
}
