import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'

import { useMasterContract, useVaultContract } from '../../hooks/useContract'

function Playground(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Playground, connected</div> : <div>Playground, disconnected</div>

  const [assets, setAssets] = useState<string>('0')
  const [farms, setFarms] = useState<string>('0')
  const [rewards, setRewards] = useState<string>('0')
  const [capitalReward, setCapitalReward] = useState<string>('0')
  const [amount, setAmount] = useState<number>(5)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()

  const master = useMasterContract()
  const vault = useVaultContract()

  const refresh = async () => {
    totalAssets()
    numFarms()
    solacePerBlock()
    solaceRewards()
    capitalRewards()
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

  const numFarms = async () => {
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

  const totalAssets = async () => {
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

  const solacePerBlock = useCallback(async () => {
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
  }, [totalAssets])

  const solaceRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    const NUM_BLOCKS_PER_DAY = 6500
    const NUM_DAYS_PER_MONTH = 30
    const SOLACE_PER_BLOCK = await solacePerBlock()
    try {
      setRewards(formatEther(SOLACE_PER_BLOCK * NUM_BLOCKS_PER_DAY * NUM_DAYS_PER_MONTH))
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const capitalRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    const NUM_BLOCKS_PER_DAY = 6500
    const SOLACE_PER_BLOCK = await solacePerBlock()
    try {
      const farmInfo = await getFarmInfo(0)
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      const capital_reward = (farmInfo.allocPoints / totalAllocPoints) * SOLACE_PER_BLOCK * NUM_BLOCKS_PER_DAY
      setCapitalReward(formatEther(capital_reward).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const getFarmInfo = async (farmId: any) => {
    setLoading(true)
    if (!masterContractRef.current) return
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
    refresh()
  }, [vault, master])

  return (
    <>
      {status}
      <div>Risk-backing ETH Capital Reward: {capitalReward}</div>
      <div>Solace Rewards: {rewards}</div>
      <div>Farms: {farms}</div>
      <div>totalAssets: {assets}</div>
      {wallet.isActive ? (
        !loading ? (
          <>
            <div>Account: {wallet.account}</div>
            <div>Chain Id: {wallet.networkId}</div>
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
