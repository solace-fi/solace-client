import { Contract } from '@ethersproject/contracts'
import { formatEther, parseEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'

export const useUserStakedValue = (farm: Contract | null | undefined): string => {
  const { account } = useWallet()
  const { version } = useCachedData()
  const [userStakedValue, setUserStakedValue] = useState<string>('0.00')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm) return
      try {
        const user = await farm.userInfo(account)
        const staked = user.value
        const formattedUserStakedValue = formatEther(staked)
        setUserStakedValue(formattedUserStakedValue)
      } catch (err) {
        console.log('getUserStakedValue', err)
      }
    }
    getUserStakedValue()
  }, [account, version, farm])

  return userStakedValue
}

export const usePoolStakedValue = (farm: Contract | null | undefined): string => {
  const [poolValue, setPoolValue] = useState<string>('0.00')

  const { latestBlock } = useCachedData()

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
  }, [farm, latestBlock])

  return poolValue
}

export const useGetTotalValueLocked = (): string => {
  const { cpFarm, lpFarm } = useContracts()
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  useEffect(() => {
    const getTotalValueLocked = async () => {
      const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
      setTotalValueLocked(formattedTVL)
    }
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue])

  return totalValueLocked
}
