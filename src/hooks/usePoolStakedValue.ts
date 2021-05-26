import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { Contract } from '@ethersproject/contracts'
import { formatEther } from '@ethersproject/units'

export const usePoolStakedValue = (farm: Contract | null | undefined): string => {
  const [poolValue, setPoolValue] = useState<string>('0.00')

  const { dataVersion } = useWallet()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await farm.valueStaked()
        const formattedPoolValue = formatEther(poolValue)
        setPoolValue(formattedPoolValue)
      } catch (err) {
        console.log('getPoolValue', err)
      }
    }
    getPoolStakedValue()
  }, [farm, dataVersion])

  return poolValue
}
