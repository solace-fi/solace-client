import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { getPolicyPrice } from '../utils/policyGetter'

export const useGetPolicyPrice = (policyId: number): string => {
  const [policyPrice, setPolicyPrice] = useState<string>('0')
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
  }, [])

  return policyPrice
}

export const useGetCancelFee = () => {
  const [cancelFee, setCancelFee] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getCancelFee = async () => {
    if (!selectedProtocol) return
    try {
      const fee = await selectedProtocol.cancelFee()
      setCancelFee(formatEther(fee))
    } catch (err) {
      console.log('getCancelFee', err)
    }
  }

  useEffect(() => {
    getCancelFee()
  }, [])

  return cancelFee
}

export const useGetYearlyCost = () => {
  const [yearlyCost, setYearlyCost] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getYearlyCost = async () => {
    if (!selectedProtocol) return
    try {
      const price = await selectedProtocol.price()
      setYearlyCost(formatEther(price))
    } catch (err) {
      console.log('getYearlyCost', err)
    }
  }

  useEffect(() => {
    getYearlyCost()
  }, [])

  return yearlyCost
}

export const useGetAvailableCoverage = () => {
  const [availableCoverage, setAvailableCoverage] = useState<string>('0.00')
  const { selectedProtocol } = useContracts()

  const getAvailableCoverage = async () => {
    if (!selectedProtocol) return
    try {
      const maxCoverAmount = await selectedProtocol.maxCoverAmount()
      const activeCoverAmount = await selectedProtocol.activeCoverAmount()
      setAvailableCoverage(formatEther(maxCoverAmount.sub(activeCoverAmount)))
    } catch (err) {
      console.log('getAvailableCoverage', err)
    }
  }

  useEffect(() => {
    getAvailableCoverage()
  }, [])

  return availableCoverage
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
