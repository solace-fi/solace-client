import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useState, useEffect, useMemo } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useProvider } from '../context/ProviderManager'
import { useWallet } from '../context/WalletManager'
import { BigNumber } from 'ethers'
import { ZERO } from '../constants'

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

export const useV1FarmRewards = () => {
  const { account } = useWallet()
  const { keyContracts } = useContracts()
  const { farmRewards, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { latestBlock } = useProvider()
  const { currencyDecimals } = useNetwork()

  const [totalEarnedSolaceRewards, setTotalEarnedSolaceRewards] = useState<BigNumber>(ZERO)
  const [totalEarnedXSolaceRewards, setTotalEarnedXSolaceRewards] = useState<BigNumber>(ZERO)
  const [purchaseableVestedSolace, setPurchaseableVestedSolace] = useState<BigNumber>(ZERO)
  const [purchaseableVestedXSolace, setPurchaseableVestedXSolace] = useState<BigNumber>(ZERO)
  const [redeemedSolaceRewards, setRedeemedSolaceRewards] = useState<BigNumber>(ZERO)
  const [redeemedXSolaceRewards, setRedeemedXSolaceRewards] = useState<BigNumber>(ZERO)
  const [unredeemedSolaceRewards, setUnredeemedSolaceRewards] = useState<BigNumber>(ZERO)
  const [unredeemedXSolaceRewards, setUnredeemedXSolaceRewards] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const populateRewardsInfo = async () => {
      if (!farmRewards || !account || !xSolace) return
      const totalEarnedXSolaceRewards = await farmRewards.farmedRewards(account)
      const totalEarnedSolaceRewards = await xSolace.xSolaceToSolace(totalEarnedXSolaceRewards)

      const redeemedXSolaceRewards = await farmRewards.redeemedRewards(account)
      const redeemedSolaceRewards = await xSolace.xSolaceToSolace(redeemedXSolaceRewards)

      const purchaseableVestedXSolace = await farmRewards.purchaseableVestedXSolace(account)
      const purchaseableVestedSolace = await xSolace.xSolaceToSolace(purchaseableVestedXSolace)

      const unredeemedSolaceRewards = totalEarnedSolaceRewards.sub(redeemedSolaceRewards)
      const unredeemedXSolaceRewards = totalEarnedXSolaceRewards.sub(redeemedXSolaceRewards)

      setUnredeemedSolaceRewards(unredeemedSolaceRewards)
      setUnredeemedXSolaceRewards(unredeemedXSolaceRewards)
      setTotalEarnedSolaceRewards(totalEarnedSolaceRewards)
      setTotalEarnedXSolaceRewards(totalEarnedXSolaceRewards)
      setPurchaseableVestedSolace(purchaseableVestedSolace)
      setPurchaseableVestedXSolace(purchaseableVestedXSolace)
      setRedeemedSolaceRewards(redeemedSolaceRewards)
      setRedeemedXSolaceRewards(redeemedXSolaceRewards)
    }
    populateRewardsInfo()
  }, [account, farmRewards, latestBlock, xSolace, currencyDecimals])

  return {
    totalEarnedSolaceRewards,
    totalEarnedXSolaceRewards,
    purchaseableVestedSolace,
    purchaseableVestedXSolace,
    redeemedSolaceRewards,
    redeemedXSolaceRewards,
    unredeemedSolaceRewards,
    unredeemedXSolaceRewards,
  }
}
