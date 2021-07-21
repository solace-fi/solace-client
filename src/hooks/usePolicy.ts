import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatEther } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { Policy, StringToStringMapping } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'

export const useGetPolicyPrice = (policyId: number): string => {
  const [policyPrice, setPolicyPrice] = useState<string>('')
  const { selectedProtocol } = useContracts()
  const { userPolicyData } = useCachedData()

  const getPrice = async () => {
    if (!selectedProtocol || policyId == 0) return
    try {
      const policy = userPolicyData.userPolicies.filter((policy: Policy) => policy.policyId == policyId)[0]
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
  const wallet = useWallet()
  const { getProtocolByName } = useContracts()
  const [appraisal, setAppraisal] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const getAppraisal = async () => {
      if (!policy) return
      try {
        const product = getProtocolByName(policy.productName)
        if (!product) return
        const position = policy.positionContract
        const appraisal: BigNumber = await product.appraisePosition(wallet.account, position)
        setAppraisal(appraisal)
      } catch (err) {
        console.log('AppraisePosition', err)
      }
    }
    getAppraisal()
  }, [policy, wallet.account])

  return appraisal
}

export const useGetMaxCoverPerUser = (): string => {
  const [maxCoverPerUser, setMaxCoverPerUser] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getMaxCoverPerUser = async () => {
    if (!selectedProtocol) return
    try {
      const maxCover = await selectedProtocol.maxCoverPerUser()
      const formattedMaxCover = formatEther(maxCover)
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

export const useGetCancelFee = (): string => {
  const [cancelFee, setCancelFee] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getCancelFee = async () => {
    if (!selectedProtocol) return
    try {
      const fee = await selectedProtocol.manageFee()
      setCancelFee(formatEther(fee))
    } catch (err) {
      console.log('getCancelFee', err)
    }
  }

  useEffect(() => {
    getCancelFee()
  }, [selectedProtocol])

  return cancelFee
}

export const useGetYearlyCosts = (): StringToStringMapping => {
  const [yearlyCosts, setYearlyCosts] = useState<StringToStringMapping>({})
  const { products, getProtocolByName } = useContracts()

  const getYearlyCosts = async () => {
    try {
      if (!products) return
      const newYearlyCosts: StringToStringMapping = {}
      for (let i = 0; i < products.length; i++) {
        let price = '0'
        const product = getProtocolByName(products[i].name)
        if (product) {
          const fetchedPrice = await product.price()
          price = formatEther(fetchedPrice)
        }
        newYearlyCosts[products[i].name] = price
      }
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

  const getAvailableCoverages = async () => {
    try {
      if (!products) return
      const newAvailableCoverages: StringToStringMapping = {}
      for (let i = 0; i < products.length; i++) {
        let coverage = '0'
        const product = getProtocolByName(products[i].name)
        if (product) {
          const maxCoverAmount = await product.maxCoverAmount()
          const activeCoverAmount = await product.activeCoverAmount()
          coverage = formatEther(maxCoverAmount.sub(activeCoverAmount))
        }
        newAvailableCoverages[products[i].name] = coverage
      }
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

export const useGetQuote = (coverLimit: string | null, positionContract: string | null, days: string): string => {
  const { account } = useWallet()
  const [quote, setQuote] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getQuote = async () => {
    if (!selectedProtocol || !coverLimit || !positionContract) return
    try {
      const quote = await selectedProtocol.getQuote(
        account,
        positionContract,
        coverLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)),
        {
          gasLimit: GAS_LIMIT,
        }
      )
      const formattedQuote = formatEther(quote)
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
  }, [coverLimit, selectedProtocol, account, positionContract, days])

  return quote
}
