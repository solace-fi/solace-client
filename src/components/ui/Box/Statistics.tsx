import React, { useEffect, useRef, useState } from 'react'
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

import { Contract } from '@ethersproject/contracts'
import { useWallet } from '../../../context/Web3Manager'
import { useContracts } from '../../../context/ContractsManager'
import { formatEther } from '@ethersproject/units'

export const Statistics = () => {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()

  const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)
  const [solaceBalance, setSolaceBalance] = useState<number>(0)

  const [totalUserRewards, setTotalUserRewards] = useState<number>(0)

  const refresh = async () => {
    getCapitalPoolSize()
    getSolaceBalance()
    getTotalUserRewards()
  }

  const getNumFarms = async () => {
    if (!masterContract.current) return
    try {
      const ans = await masterContract.current.numFarms().then((ans: any) => {
        return ans
      })
      return ans
    } catch (err) {
      console.log('error getNumFarms ', err)
    }
  }

  const getTotalUserRewards = async () => {
    const farms = await getNumFarms()
    if (farms === 0 || !wallet.account) return
    try {
      const cpUserRewards = await getCpUserRewards()
      const lpUserRewards = await getLpUserRewards()

      const rewards = (cpUserRewards || 0) + (lpUserRewards || 0)
      if (totalUserRewards !== rewards) setTotalUserRewards(rewards)
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getCpUserRewards = async () => {
    const farms = await getNumFarms()
    if (!cpFarmContract.current || farms === 0 || !wallet.account) return
    try {
      let rewards = 0
      for (let i = 0; i < farms; i++) {
        const pendingReward = await cpFarmContract.current.pendingRewards(wallet.account)
        rewards += parseFloat(pendingReward)
      }
      return rewards
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getLpUserRewards = async () => {
    const farms = await getNumFarms()
    if (!lpFarmContract.current || farms === 0 || !wallet.account) return
    try {
      let rewards = 0
      for (let i = 0; i < farms; i++) {
        const pendingReward = await lpFarmContract.current.pendingRewards(wallet.account)
        rewards += parseFloat(pendingReward)
      }
      return rewards
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getCapitalPoolSize = async () => {
    if (!vaultContract.current) return
    try {
      const ans = await vaultContract.current.totalAssets().then((ans: any) => {
        return ans
      })
      setCapitalPoolSize(ans)
    } catch (err) {
      console.log('error getTotalAssets ', err)
    }
  }

  const getSolaceBalance = async () => {
    if (!solaceContract.current?.provider || !wallet.account) return

    try {
      const balance = await solaceContract.current.balanceOf(wallet.account)
      if (solaceBalance !== balance) setSolaceBalance(balance.toNumber())
    } catch (err) {
      console.log('error getSolaceBalance ', err)
    }
  }

  useEffect(() => {
    masterContract.current = master
    vaultContract.current = vault
    solaceContract.current = solace
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm

    refresh()
  }, [master, vault, solace, cpFarm, lpFarm, wallet])

  return (
    <BoxRow>
      <Box>
        <BoxItem>
          <BoxItemTitle h3>My Balance</BoxItemTitle>
          <BoxItemValue h2>
            {`${solaceBalance} `}
            <BoxItemUnits h3>SOLACE</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>My Rewards</BoxItemTitle>
          <BoxItemValue h2>
            {`${totalUserRewards} `}
            <BoxItemUnits h3>SOLACE</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <Button>Claim</Button>
      </Box>
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2>{formatEther(capitalPoolSize).toString()}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2>HC$2,000,000</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2>HC1,200</BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
