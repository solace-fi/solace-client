import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'

export const useGetYearlyCost = () => {
  const { compProduct } = useContracts()
  const [yearlyCost, setYearlyCost] = useState<string>('0.00')

  const getYearlyCost = async () => {
    if (!compProduct) return
    try {
      const price = await compProduct.price()
      setYearlyCost(formatEther(price))
    } catch (err) {
      console.log('getAvailableCoverage', err)
    }
  }

  useEffect(() => {
    getYearlyCost()
  }, [])

  return yearlyCost
}

export const useGetAvailableCoverage = () => {
  const { compProduct } = useContracts()
  const [availableCoverage, setAvailableCoverage] = useState<string>('0.00')

  const getAvailableCoverage = async () => {
    if (!compProduct) return
    try {
      const maxCoverAmount = await compProduct.maxCoverAmount()
      const activeCoverAmount = await compProduct.activeCoverAmount()
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

export const useGetQuote = (coverLimit: string, positionContract: string, days: string): any => {
  const { compProduct } = useContracts()
  const { account } = useWallet()
  const [quote, setQuote] = useState<string>('0.00')

  const getQuote = async () => {
    if (!compProduct) return
    try {
      const quote = await compProduct.getQuote(
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
  }, [coverLimit, compProduct, account, positionContract, days])

  return quote
}
