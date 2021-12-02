import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useState, useEffect, useMemo } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useProvider } from '../context/ProviderManager'
import { useWallet } from '../context/WalletManager'

export const useUserStakedValue = (farm: Contract | null | undefined): string => {
  const { account } = useWallet()
  const { currencyDecimals } = useNetwork()
  const { version } = useCachedData()
  const [userStakedValue, setUserStakedValue] = useState<string>('0')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm || !account) return
      try {
        const userStaked = await farm.userStaked(account)
        const formattedUserStakedValue = formatUnits(userStaked, currencyDecimals)
        setUserStakedValue(formattedUserStakedValue)
      } catch (err) {
        console.log('getUserStakedValue', err)
      }
    }
    getUserStakedValue()
  }, [account, version, farm, currencyDecimals])

  return userStakedValue
}

export const usePoolStakedValue = (farm: Contract | null | undefined): string => {
  const [poolValue, setPoolValue] = useState<string>('0')
  const { latestBlock } = useProvider()
  const { currencyDecimals } = useNetwork()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await farm.valueStaked()
        const formattedPoolValue = formatUnits(poolValue, currencyDecimals)
        setPoolValue(formattedPoolValue)
      } catch (err) {
        console.log('getPoolValue', err)
      }
    }
    getPoolStakedValue()
  }, [farm, latestBlock, currencyDecimals])

  return poolValue
}

export const useGetTotalValueLocked = (): string => {
  const { currencyDecimals } = useNetwork()
  const { keyContracts } = useContracts()
  const { cpFarm, lpFarm } = useMemo(() => keyContracts, [keyContracts])
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0')
  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  useEffect(() => {
    const getTotalValueLocked = async () => {
      const formattedTVL = formatUnits(
        parseUnits(cpPoolValue, currencyDecimals).add(parseUnits(lpPoolValue, currencyDecimals)),
        currencyDecimals
      )
      setTotalValueLocked(formattedTVL)
    }
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue, currencyDecimals])

  return totalValueLocked
}
