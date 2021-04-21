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
  const [cp, setCp] = useState<string>('0')
  const [valueStaked, setValueStaked] = useState<string>('0')

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()
  const solaceContractRef = useRef<Contract>()
  const erc20farmContractRef = useRef<Contract>()

  const { master, vault, solace, erc20farm } = useContracts()

  const refresh = async () => {
    getSolaceBalance()
    getTotalAssets()
    getNumFarms()
    getSolaceRewards()
    // getCapitalRewards()
    getCurrentRewards()
    getRewardsPerDay()
    // getRoi()
    getCp()
    getValueStaked()
  }

  const getCp = async () => {
    setLoading(true)
    if (!vaultContractRef.current?.provider) return

    try {
      const balance = await vaultContractRef.current.balanceOf(wallet.account)
      setCp(formatEther(BigNumber.from(balance)).toString())
    } catch (err) {
      console.log('getCp ', err)
    }
    setLoading(false)
  }

  const getSolaceBalance = async () => {
    setLoading(true)
    if (!solaceContractRef.current?.provider) return

    try {
      const balance = await solaceContractRef.current.balanceOf(wallet.account)
      setSolaceBalance(formatEther(BigNumber.from(balance)).toString())
    } catch (err) {
      console.log('getSolaceBalance ', err)
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
      console.log('getNumFarms ', err)
    }
    setLoading(false)
  }

  const getRewardsPerDay = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current?.provider) return
    const userInfo = await erc20farmContractRef.current.userInfo[wallet.account ? wallet.account : 0]
    if (!userInfo) return
    const value = userInfo.value
    const farmInfo = await getFarmInfo()
    const rewardsPerDay = (value / farmInfo.value) * parseFloat(capitalRewards ? capitalRewards : '0')
    setRewardsPerDay(formatEther(BigNumber.from(rewardsPerDay)).toString())
    try {
    } catch (err) {
      console.log('getRewardsPerDay ', err)
    }
    setLoading(false)
  }

  const getTotalAssets = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return
    try {
      const ans = await vaultContractRef.current.totalAssets().then((ans: any) => {
        return ans
      })
      setAssets(formatEther(BigNumber.from(ans)).toString())
    } catch (err) {
      console.log('getTotalAssets ', err)
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
      return ans
    } catch (err) {
      console.log('getSolacePerBlock ', err)
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
      console.log('getSolaceRewards ', err)
    }
    setLoading(false)
  }

  const getAllocPointsPerSolacePerBlockPerDay = async (farmId: any = 0) => {
    setLoading(true)
    if (!masterContractRef.current) return
    const solacePerBlock = await getSolacePerBlock()
    try {
      const farmInfo = await getFarmInfo()
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      return (farmInfo.allocPoints / totalAllocPoints) * solacePerBlock * NUM_BLOCKS_PER_DAY
    } catch (err) {
      console.log('getAllocPointsPerSolacePerBlockPerDay ', err)
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
      console.log('getRoi ', err)
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
      console.log('getCapitalRewards ', err)
    }
    setLoading(false)
  }

  const getCurrentRewards = async () => {
    setLoading(true)
    if (!masterContractRef.current || farms === '') return
    try {
      let currentRewards = 0
      for (let i = 0; i < parseInt(farms); i++) {
        const reward = await getPendingRewards()
        currentRewards += reward
      }
      setCurrentRewards(formatEther(currentRewards).toString())
    } catch (err) {
      console.log('getCurrentRewards ', err)
    }
    setLoading(false)
  }

  const getPendingRewards = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current || farms === '') return
    try {
      const pendingReward = await erc20farmContractRef.current.pendingRewards(wallet.account)
      return pendingReward
    } catch (err) {
      console.log('getPendingRewards ', err)
    }
    setLoading(false)
  }

  const getValueStaked = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current || farms === '') return
    try {
      const farmInfo = await erc20farmContractRef.current.valueStaked()
      setValueStaked(formatEther(BigNumber.from(farmInfo)).toString())
    } catch (err) {
      console.log('getFarmInfo ', err)
    }
    setLoading(false)
  }

  const getFarmInfo = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current || farms === '') return
    try {
      const farmInfo = await erc20farmContractRef.current.valueStaked()
      console.log('farm value staked: ', formatEther(BigNumber.from(farmInfo)).toString())
      return farmInfo
    } catch (err) {
      console.log('getFarmInfo ', err)
    }
    setLoading(false)
  }

  const callDepositErc20 = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current || !vaultContractRef.current) return
    try {
      const approval = await vaultContractRef.current.approve(
        erc20farmContractRef.current.address,
        ethers.utils.parseEther(amount.toString())
      )
      await approval.wait()
      const approvalEvent = await vaultContractRef.current.on('Approval', (owner, spender, value, tx) => {
        console.log('approval event: ', tx)
      })
      const deposit = await erc20farmContractRef.current.deposit(ethers.utils.parseEther(amount.toString()))
      await deposit.wait()
      const depositEvent = await erc20farmContractRef.current.on('Deposit', (sender, amount, tx) => {
        console.log('depositErc20 event: ', tx)
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callDepositErc20 ', err)
    }
  }

  const callWithdrawErc20 = async () => {
    setLoading(true)
    if (!erc20farmContractRef.current) return
    try {
      const withdraw = await erc20farmContractRef.current.withdraw(ethers.utils.parseEther(amount.toString()))
      await withdraw.wait()
      const withdrawEvent = await erc20farmContractRef.current.on('Withdraw', (sender, amount, tx) => {
        console.log('withdrawErc20 event: ', tx)
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawErc20 ', err)
    }
  }

  const callDepositErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.depositErc721(0, 0)
      return ans
    } catch (err) {
      console.log('callDepositErc721 ', err)
    }
    setLoading(false)
  }

  const callWithdrawErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return

    try {
      const tx = await masterContractRef.current.withdrawErc721(0, 0)
      await tx.wait()
      const r = await masterContractRef.current.on('WithdrawErc721', (sender, farmId, token, tx) => {
        console.log('withdrawVault event: ', tx)
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawErc721 ', err)
    }
  }

  const callDepositVault = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await tx.wait()
      const r = await vaultContractRef.current.on('DepositMade', (sender, amount, shares, tx) => {
        console.log('depositVault event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callDepositVault ', err)
    }
  }

  const callWithdrawVault = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.withdraw(ethers.utils.parseEther(amount.toString()), maxLoss)
      await tx.wait()
      const r = await vaultContractRef.current.on('WithdrawalMade', (sender, value, tx) => {
        console.log('withdrawal event: ', tx)
        wallet.updateBalance(wallet.balance.add(value))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawVault ', err)
    }
  }

  useMemo(() => {
    vaultContractRef.current = vault
    masterContractRef.current = master
    solaceContractRef.current = solace
    erc20farmContractRef.current = erc20farm
    refresh()
  }, [vault, master, solace, erc20farm])

  return (
    <>
      {status}
      <div>Risk-backing ETH Capital Reward: {capitalRewards}</div>
      <div>Solace Rewards: {solaceRewards}</div>
      <div>ROI: {roi}</div>
      <div>Farms: {farms}</div>
      <div>Farm value staked: {valueStaked}</div>
      <div>totalAssets: {assets}</div>
      {wallet.isActive ? (
        !loading ? (
          <>
            <div>Account: {wallet.account}</div>
            <div>Chain Id: {wallet.networkId}</div>
            <div>Solace Balance: {solaceBalance}</div>
            <div>Current Rewards: {currentRewards}</div>
            <div>CP Tokens: {cp}</div>
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
            <button onClick={callDepositVault}>deposit into vault</button>
            <button onClick={callWithdrawVault}>withdraw from vault</button>
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
