import React, { useEffect, useRef, useState } from 'react'
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

import { Contract } from '@ethersproject/contracts'
import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import { formatEther, parseEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useSolaceBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'

export const Statistics = () => {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()

  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  // const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)
  const capitalPoolSize = useCapitalPoolSize()
  // const [solaceBalance, setSolaceBalance] = useState<string>('0.00')
  const solaceBalance = useSolaceBalance()
  // const [scp, setScp] = useState<string>('0.00')
  const scpBalance = useScpBalance()

  const [lp, setLp] = useState<number>(0)

  // const [totalUserRewards, setTotalUserRewards] = useState<string>('0.00')
  const totalUserRewards = useTotalPendingRewards()

  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  const refresh = async () => {
    // getCapitalPoolSize()
    // getSolaceBalance()
    // getTotalUserRewards()
    getTotalValueLocked()
    // getScp()
    // getLp()
  }

  // const getLp = async () => {
  //   if (!lpTokenContract.current?.provider || !wallet.account) return

  //   try {
  //     const balance = await lpTokenContract.current.totalSupply(wallet.account)
  //     const formattedBalance = parseFloat(formatEther(balance))
  //     if (lp !== balance) setLp(formattedBalance)
  //     return balance
  //   } catch (err) {
  //     console.log('error getScp ', err)
  //   }
  // }

  // const claimRewards = async () => {
  //   if (!cpFarmContract.current?.provider || !lpFarmContract.current?.provider || !wallet.account) return
  //   try {
  //     await cpFarmContract.current.balanceOf(wallet.account)
  //     const formattedBalance = parseFloat(formatEther(balance))
  //     if (scp !== balance) setScp(formattedBalance)
  //     return balance
  //   } catch (err) {
  //     console.log('error getScp ', err)
  //   }
  // }

  // const getScp = async () => {
  //   if (!vaultContract.current?.provider || !wallet.account) return

  //   try {
  //     const balance = await vaultContract.current.balanceOf(wallet.account)
  //     const formattedBalance = formatEther(balance)
  //     setScp(formattedBalance)
  //   } catch (err) {
  //     console.log('error getScp ', err)
  //   }
  // }

  // const getTotalUserRewards = async () => {
  //   const farms = await masterContract.current?.numFarms()
  //   if (farms.isZero() || !wallet.account || !cpFarmContract.current || !lpFarmContract.current) return
  //   try {
  //     const cpUserRewards = await cpFarmContract.current.pendingRewards(wallet.account)
  //     const lpUserRewards = await lpFarmContract.current.pendingRewards(wallet.account)

  //     const rewards = cpUserRewards.add(lpUserRewards)
  //     const formattedRewards = formatEther(rewards)
  //     setTotalUserRewards(formattedRewards)
  //   } catch (err) {
  //     console.log('error getUserRewards ', err)
  //   }
  // }

  // const getCapitalPoolSize = async () => {
  //   if (!vaultContract.current) return
  //   try {
  //     const ans = await vaultContract.current.totalAssets()
  //     setCapitalPoolSize(ans)
  //   } catch (err) {
  //     console.log('error getTotalAssets ', err)
  //   }
  // }

  // const getSolaceBalance = async () => {
  //   if (!solaceContract.current?.provider || !wallet.account) return

  //   try {
  //     const balance = await solaceContract.current.balanceOf(wallet.account)
  //     setSolaceBalance(balance)
  //   } catch (err) {
  //     console.log('error getSolaceBalance ', err)
  //   }
  // }

  const getTotalValueLocked = () => {
    const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
    // console.log('tvl', formattedTVL)
    setTotalValueLocked(formattedTVL)
  }

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    lpTokenContract.current = lpToken
    masterContract.current = master
    solaceContract.current = solace
    vaultContract.current = vault

    refresh()
  }, [master, vault, solace, cpFarm, lpFarm, lpToken])

  useEffect(() => {
    refresh()
  }, [cpPoolValue, lpPoolValue, wallet])

  return (
    <BoxRow>
      {wallet.initialized ? (
        <Box>
          <BoxItem>
            <BoxItemTitle h3>My Balance</BoxItemTitle>
            <BoxItemValue h2>
              {`${parseFloat(solaceBalance).toFixed(2)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My SCP</BoxItemTitle>
            <BoxItemValue h2>
              {`${parseFloat(scpBalance).toFixed(2)} `}
              <BoxItemUnits h3>TOKENS</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          {/* <BoxItem>
          <BoxItemTitle h3>My LP</BoxItemTitle>
          <BoxItemValue h2>
            {`${lp} `}
            <BoxItemUnits h3>TOKENS</BoxItemUnits>
          </BoxItemValue>
        </BoxItem> */}
          <BoxItem>
            <BoxItemTitle h3>My Rewards</BoxItemTitle>
            <BoxItemValue h2>
              {`${parseFloat(totalUserRewards).toFixed(2)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <Button>Claim</Button>
          </BoxItem>
        </Box>
      ) : (
        <Box>
          <BoxItem>
            <Button
              onClick={() =>
                wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
              }
            >
              Connect Wallet
            </Button>
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2>{parseFloat(formatEther(capitalPoolSize).toString()).toFixed(2)}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <BoxItemValue h2>{parseFloat(totalValueLocked).toFixed(2)}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2>$2,000,000</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2>1,200</BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
