import { useState, useEffect, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useWallet } from '../../context/WalletManager'
import { BigNumber } from 'ethers'
import { ZERO } from '../../constants'
import { earlyFarmRewards } from '../../constants/mappings/earlyFarmRewards'

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
