import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units'
import { useState, useEffect, useMemo } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useWallet } from '../../context/WalletManager'
import { BigNumber } from 'ethers'
import { ZERO } from '../../constants'
import { earlyFarmRewards } from '../../constants/mappings/earlyFarmRewards'

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

export const useEarlyFarmRewards = () => {
  const { account } = useWallet()
  const { keyContracts } = useContracts()
  const { farmRewards, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { latestBlock } = useProvider()
  const { currencyDecimals } = useNetwork()

  const [totalEarnedSolaceRewards, setTotalEarnedSolaceRewards] = useState<BigNumber>(ZERO)
  const [purchaseableSolace, setPurchaseableSolace] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const populateRewardsInfo = async () => {
      if (!farmRewards || !account || !xSolaceV1) return
      const rewards = earlyFarmRewards[account.toLowerCase()]
      if (!rewards) return
      const totalEarnedSolaceRewards = BigNumber.from(rewards)

      const purchaseableSolace = await farmRewards.purchaseableSolace(account)

      setTotalEarnedSolaceRewards(totalEarnedSolaceRewards)
      setPurchaseableSolace(purchaseableSolace)
    }
    populateRewardsInfo()
  }, [account, farmRewards, latestBlock, xSolaceV1, currencyDecimals])

  return {
    totalEarnedSolaceRewards,
    purchaseableSolace,
  }
}
