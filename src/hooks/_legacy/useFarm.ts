import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { withBackoffRetries } from '../../utils/time'

export const useUserStakedValue = (farm: Contract | null | undefined): string => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [userStakedValue, setUserStakedValue] = useState<string>('0')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm || !account) return
      try {
        const userStaked = await withBackoffRetries(async () => farm.userStaked(account))
        const formattedUserStakedValue = formatUnits(userStaked, activeNetwork.nativeCurrency.decimals)
        setUserStakedValue(formattedUserStakedValue)
      } catch (err) {
        console.log('getUserStakedValue', err)
      }
    }
    getUserStakedValue()
  }, [account, version, farm, activeNetwork.nativeCurrency.decimals])

  return userStakedValue
}

export const usePoolStakedValue = (farm: Contract | null | undefined): string => {
  const [poolValue, setPoolValue] = useState<string>('0')
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await withBackoffRetries(async () => farm.valueStaked())
        const formattedPoolValue = formatUnits(poolValue, activeNetwork.nativeCurrency.decimals)
        setPoolValue(formattedPoolValue)
      } catch (err) {
        console.log('getPoolValue', err)
      }
    }
    getPoolStakedValue()
  }, [farm, latestBlock, activeNetwork.nativeCurrency.decimals])

  return poolValue
}
