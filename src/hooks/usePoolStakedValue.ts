import { useState, useEffect } from 'react'
import { useWallet } from '../context/Web3Manager'
import { Contract } from '@ethersproject/contracts'
import { formatEther } from '@ethersproject/units'

export const usePoolStakedValue = (farm: Contract | null | undefined) => {
  const [poolValue, setPoolValue] = useState<string>('0.00')

  const wallet = useWallet()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await farm.valueStaked()
        const formattedPoolValue = formatEther(poolValue)
        // console.log('pool value', formattedPoolValue)
        setPoolValue(formattedPoolValue)
      } catch (err) {
        console.log('getPoolValue', err)
      }
    }
    getPoolStakedValue()
  }, [farm, wallet])

  return poolValue
}
