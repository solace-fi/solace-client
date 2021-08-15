import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { Policy, StringToStringMapping } from '../constants/types'
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
      if (!policy.price) return
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
  const { account } = useWallet()
  const { getProtocolByName } = useContracts()
  const [appraisal, setAppraisal] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const getAppraisal = async () => {
      if (!policy) return
      try {
        const product = getProtocolByName(policy.productName)
        if (!product) return
        const position = policy.positionContract
        const appraisal: BigNumber = await product.appraisePosition(account, position)
        setAppraisal(appraisal)
      } catch (err) {
        console.log('AppraisePosition', err)
      }
    }
    getAppraisal()
  }, [policy, account, getProtocolByName])

  return appraisal
}

export const useGetMaxCoverPerUser = (): string => {
  const [maxCoverPerUser, setMaxCoverPerUser] = useState<string>('0')
  const { selectedProtocol } = useContracts()
  const { activeNetwork } = useNetwork()

  const getMaxCoverPerUser = async () => {
    if (!selectedProtocol) return
    try {
      const maxCover = await selectedProtocol.maxCoverPerUser()
      const formattedMaxCover = formatUnits(maxCover, activeNetwork.nativeCurrency.decimals)
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
  const { activeNetwork } = useNetwork()

  const getYearlyCosts = async () => {
    try {
      if (!products) return
      const newYearlyCosts: StringToStringMapping = {}
      await Promise.all(
        products.map(async (productContract) => {
          const product = getProtocolByName(productContract.name)
          if (product) {
            const fetchedPrice = await product.price()
            newYearlyCosts[productContract.name] = formatUnits(fetchedPrice, activeNetwork.nativeCurrency.decimals)
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
  const { activeNetwork } = useNetwork()

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
            const coverage = formatUnits(maxCoverAmount.sub(activeCoverAmount), activeNetwork.nativeCurrency.decimals)
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
  const [quote, setQuote] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()
  const { activeNetwork } = useNetwork()

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
      const formattedQuote = formatUnits(quote, activeNetwork.nativeCurrency.decimals)
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
