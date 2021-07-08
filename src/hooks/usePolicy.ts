import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../constants'
import { PROTOCOLS_LIST } from '../constants/protocols'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { getPolicyPrice } from '../utils/paclas'

export const useGetPolicyPrice = (policyId: number): string => {
  const [policyPrice, setPolicyPrice] = useState<string>('')
  const { selectedProtocol } = useContracts()

  const getPrice = async () => {
    if (!selectedProtocol) return
    try {
      const price = await getPolicyPrice(policyId)
      setPolicyPrice(price)
    } catch (err) {
      console.log('getPolicyPrice', err)
    }
  }

  useEffect(() => {
    getPrice()
  }, [selectedProtocol, policyId])

  return policyPrice
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

export const useGetCancelFee = () => {
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

export const useGetYearlyCosts = () => {
  const [yearlyCosts, setYearlyCosts] = useState<any>({})
  const { getProtocolByName } = useContracts()

  const getYearlyCosts = async () => {
    try {
      const newYearlyCosts: any = {}
      for (let i = 0; i < PROTOCOLS_LIST.length; i++) {
        let price = '0'
        const product = getProtocolByName(PROTOCOLS_LIST[i].toLowerCase())
        if (product) {
          const fetchedPrice = await product.price()
          price = formatEther(fetchedPrice)
        }
        newYearlyCosts[PROTOCOLS_LIST[i].toLowerCase()] = price
      }
      setYearlyCosts(newYearlyCosts)
    } catch (err) {
      console.log('getYearlyCost', err)
    }
  }

  useEffect(() => {
    getYearlyCosts()
  }, [])

  return yearlyCosts
}

export const useGetAvailableCoverages = () => {
  const [availableCoverages, setAvailableCoverages] = useState<any>({})
  const { getProtocolByName } = useContracts()

  const getAvailableCoverages = async () => {
    try {
      const newAvailableCoverages: any = {}
      for (let i = 0; i < PROTOCOLS_LIST.length; i++) {
        let coverage = '0'
        const product = getProtocolByName(PROTOCOLS_LIST[i].toLowerCase())
        if (product) {
          const maxCoverAmount = await product.maxCoverAmount()
          const activeCoverAmount = await product.activeCoverAmount()
          coverage = formatEther(maxCoverAmount.sub(activeCoverAmount))
        }
        newAvailableCoverages[PROTOCOLS_LIST[i].toLowerCase()] = coverage
      }
      setAvailableCoverages(newAvailableCoverages)
    } catch (err) {
      console.log('getAvailableCoverage', err)
      return '0'
    }
  }

  useEffect(() => {
    getAvailableCoverages()
  }, [])

  return availableCoverages
}

export const useGetQuote = (coverLimit: string | null, positionContract: string | null, days: string): any => {
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
