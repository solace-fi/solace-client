import { useState, useEffect, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { BigNumber } from 'ethers'
import { ZERO } from '../../constants'
import { earlyFarmRewards } from '../../constants/mappings/earlyFarmRewards'
import { useWeb3React } from '@web3-react/core'
import { useCachedData } from '../../context/CachedDataManager'

export const useEarlyFarmRewards = () => {
  const { account } = useWeb3React()
  const { keyContracts } = useContracts()
  const { farmRewards, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { minute } = useCachedData()
  const { activeNetwork } = useNetwork()

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
  }, [account, farmRewards, minute, xSolaceV1, activeNetwork.nativeCurrency.decimals])

  return {
    totalEarnedSolaceRewards,
    purchaseableSolace,
  }
}
