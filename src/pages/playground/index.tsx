import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR } from '../../constants'

function Playground(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Playground, connected</div> : <div>Playground, disconnected</div>

  const [assets, setAssets] = useState<string>('0')
  const [farms, setFarms] = useState<string>('0')
  const [roi, setRoi] = useState<string>('0')
  const [solaceBalance, setSolaceBalance] = useState<string>('0')
  const [solaceRewards, setSolaceRewards] = useState<string>('0')
  const [currentRewards, setCurrentRewards] = useState<string>('0')
  const [capitalRewards, setCapitalRewards] = useState<string>('0')
  const [rewardsPerDay, setRewardsPerDay] = useState<string>('0')
  const [amount, setAmount] = useState<number>(5)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()
  const solaceContractRef = useRef<Contract>()

  const { master, vault, solace } = useContracts()

  const refresh = async () => {
    getSolaceBalance()
    getTotalAssets()
    getNumFarms()
    getSolaceRewards()
    getCapitalRewards()
    getCurrentRewards()
    getRewardsPerDay()
    getRoi()
  }

  const getSolaceBalance = async () => {
    setLoading(true)
    if (!solaceContractRef.current) return

    try {
      const balance = await solaceContractRef.current.balanceOf(wallet.account)
      setSolaceBalance(formatEther(BigNumber.from(balance)).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callDeposit = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await tx.wait()
      refresh()
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getNumFarms = async () => {
    setLoading(true)
    if (!masterContractRef.current) return

    try {
      const ans = await masterContractRef.current.numFarms()
      setFarms(ans.toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callWithdraw = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.withdraw(ethers.utils.parseEther(amount.toString()), maxLoss)
      await tx.wait()
      refresh()
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getRewardsPerDay = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    const userInfo = await masterContractRef.current.userInfo[wallet.account ? wallet.account : 0]
    if (!userInfo) return
    const value = userInfo.value
    const farmInfo = await getFarmInfo(0)
    const rewardsPerDay = (value / farmInfo.value) * parseFloat(capitalRewards ? capitalRewards : '0')
    setRewardsPerDay(formatEther(BigNumber.from(rewardsPerDay)).toString())
    try {
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getTotalAssets = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const ans = await vaultContractRef.current.totalAssets().then((ans: any) => {
        wallet.fetchBalance()
        return ans
      })
      setAssets(formatEther(BigNumber.from(ans)).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getSolacePerBlock = useCallback(async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.solacePerBlock().then((ans: any) => {
        return ans
      })
      console.log('solace per block ', formatEther(BigNumber.from(ans)).toString())
      return ans
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }, [])

  const getSolaceRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    const solacePerBlock = await getSolacePerBlock()
    try {
      setSolaceRewards(formatEther(solacePerBlock * NUM_BLOCKS_PER_DAY * NUM_DAYS_PER_MONTH))
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getAllocPointsPerSolacePerBlockPerDay = async (farmId: any = 0) => {
    setLoading(true)
    if (!masterContractRef.current) return
    const solacePerBlock = await getSolacePerBlock()
    try {
      const farmInfo = await getFarmInfo(farmId)
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      return (farmInfo.allocPoints / totalAllocPoints) * solacePerBlock * NUM_BLOCKS_PER_DAY
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getRoi = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const capitalReward = await getAllocPointsPerSolacePerBlockPerDay(0)
      const roi = capitalReward ? capitalReward : 0 * DAYS_PER_YEAR
      setRoi(formatEther(BigNumber.from(roi)).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getCapitalRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const capitalReward = await getAllocPointsPerSolacePerBlockPerDay(0)
      setCapitalRewards(formatEther(BigNumber.from(capitalReward)).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getCurrentRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current || farms === '') return
    try {
      let currentRewards = 0
      for (let i = 0; i < parseInt(farms); i++) {
        const reward = await getPendingReward(i)
        currentRewards += reward
      }
      setCurrentRewards(formatEther(currentRewards).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getPendingReward = async (farmId: any) => {
    setLoading(true)
    if (!masterContractRef.current || farms === '') return
    try {
      const pendingReward = await masterContractRef.current.pendingReward(farmId, wallet.account)
      return pendingReward
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getFarmInfo = async (farmId: any) => {
    setLoading(true)
    if (!masterContractRef.current || farms === '') return
    try {
      const farmInfo = await masterContractRef.current.farmInfo[farmId]
      return farmInfo
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callDepositErc20 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.depositErc20(0, amount)
      return ans
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callWithdrawErc20 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.withdrawErc20(0, amount)
      return ans
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callDepositErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.depositErc721(0, 0)
      return ans
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callWithdrawErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.withdrawErc721(0, 0)
      return ans
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  useMemo(() => {
    console.log('setting contracts', vault, master)
    vaultContractRef.current = vault
    masterContractRef.current = master
    solaceContractRef.current = solace
    refresh()
  }, [vault, master, solace])

  return (
    <>
      {status}
      <div>Risk-backing ETH Capital Reward: {capitalRewards}</div>
      <div>Solace Rewards: {solaceRewards}</div>
      <div>ROI: {roi}</div>
      <div>Farms: {farms}</div>
      <div>totalAssets: {assets}</div>
      {wallet.isActive ? (
        !loading ? (
          <>
            <div>Account: {wallet.account}</div>
            <div>Chain Id: {wallet.networkId}</div>
            <div>Solace Balance: {solaceBalance}</div>
            <div>Current Rewards: {currentRewards}</div>
            <div>Rewards per day: {rewardsPerDay}</div>
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              value={`${amount}`}
              id="amount"
              onChange={(e) => setAmount(parseInt(e.target.value))}
            />
            <label htmlFor="maxLoss">Max Loss: {maxLoss}</label>
            <input
              type="range"
              name="maxLoss"
              id="maxLoss"
              min="1"
              max="10"
              value={maxLoss}
              step="1"
              onChange={(e) => setMaxLoss(parseInt(e.target.value))}
            />
            <button onClick={callDeposit}>deposit into vault</button>
            <button onClick={callWithdraw}>withdraw from vault</button>
            <button onClick={callDepositErc20}>deposit CP</button>
            <button onClick={callWithdrawErc20}>withdraw CP</button>
            <button onClick={callDepositErc721}>deposit LP</button>
            <button onClick={callWithdrawErc721}>withdraw LP</button>
          </>
        ) : (
          <div>Loading</div>
        )
      ) : null}
      <Coins />
    </>
  )
}

export default Playground
