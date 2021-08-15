import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'

export const useUserStakedValue = (farm: Contract | null | undefined, account: string | undefined): string => {
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [userStakedValue, setUserStakedValue] = useState<string>('0.00')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm || !account) return
      try {
        const user = await farm.userInfo(account)
        const staked = user.value
        const formattedUserStakedValue = formatUnits(staked, activeNetwork.nativeCurrency.decimals)
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
  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await farm.valueStaked()
        const formattedPoolValue = formatUnits(poolValue, activeNetwork.nativeCurrency.decimals)
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
  const { activeNetwork } = useNetwork()
  const { cpFarm, lpFarm } = useContracts()
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  useEffect(() => {
    const getTotalValueLocked = async () => {
      const formattedTVL = formatUnits(
        parseUnits(cpPoolValue, activeNetwork.nativeCurrency.decimals).add(
          parseUnits(lpPoolValue, activeNetwork.nativeCurrency.decimals)
        ),
        activeNetwork.nativeCurrency.decimals
      )
      setTotalValueLocked(formattedTVL)
    }
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue])

  return totalValueLocked
}
