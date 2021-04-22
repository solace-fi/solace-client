import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import { ethers, BigNumber as BN, constants } from 'ethers'
import { formatEther } from '@ethersproject/units'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'
import { getPermitDigest, sign, getDomainSeparator } from '../../utils/signature'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR, TOKEN_NAME } from '../../constants'

function Playground(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Playground, connected</div> : <div>Playground, disconnected</div>

  const [assets, setAssets] = useState<string>('0')
  const [farms, setFarms] = useState<string>('0')
  const [solaceBalance, setSolaceBalance] = useState<string>('0')

  const [rewardsPerDay, setRewardsPerDay] = useState<string>('0')
  const [userRewardsPerDay, setUserRewardsPerDay] = useState<string>('0')
  const [userRewards, setUserRewards] = useState<string>('0')

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
    console.log('refresh: ', master, vault, solace, erc20farm)
    getSolaceBalance()
    getTotalAssets()
    getNumFarms()
    getUserRewards()
    getUserRewardsPerDay()
    getRewardsPerDay()
    getCp()
    getFarmValueStaked()
  }

  const getRewardsPerDay = async () => {
    if (!masterContractRef.current) return

    try {
      const allocPoints = await masterContractRef.current.allocPoints(0)
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      const solacePerBlock = await masterContractRef.current.solacePerBlock()
      const rewardsPerDay = (allocPoints / totalAllocPoints) * solacePerBlock * NUM_BLOCKS_PER_DAY
      setRewardsPerDay(formatEther(BigNumber.from(rewardsPerDay)).toString())
    } catch (err) {
      console.log('getRewardsPerDay ', err)
    }
  }

  const getUserRewardsPerDay = async () => {
    if (!erc20farmContractRef.current?.provider || !masterContractRef.current) return
    const userInfo = await erc20farmContractRef.current.userInfo[wallet.account ? wallet.account : 0]
    if (!userInfo) return
    try {
      const value = userInfo.value
      const farmValue = await getFarmValueStaked()
      const allocPoints = await masterContractRef.current.allocPoints()
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      const solacePerBlock = await masterContractRef.current.solacePerBlock()
      const userRewardsPerDay =
        (allocPoints / totalAllocPoints) * solacePerBlock * NUM_BLOCKS_PER_DAY * (value / farmValue)
      setUserRewardsPerDay(formatEther(BigNumber.from(userRewardsPerDay)).toString())
    } catch (err) {
      console.log('getRewardsPerDay ', err)
    }
  }

  const getUserRewards = async () => {
    if (!wallet.isActive || !erc20farmContractRef.current || farms === '') return
    try {
      let userRewards = 0
      for (let i = 0; i < parseInt(farms); i++) {
        const pendingReward = await erc20farmContractRef.current.pendingRewards(wallet.account)
        userRewards += pendingReward
      }
      setUserRewards(formatEther(userRewards).toString())
    } catch (err) {
      console.log('getUserRewards ', err)
    }
  }

  const getFarmValueStaked = async () => {
    if (!erc20farmContractRef.current || farms === '') return
    try {
      const farmValueStaked = await erc20farmContractRef.current.valueStaked()
      setValueStaked(formatEther(BigNumber.from(farmValueStaked)).toString())
      return farmValueStaked
    } catch (err) {
      console.log('getValueStaked ', err)
    }
  }

  const getCp = async () => {
    if (!vaultContractRef.current?.provider) return

    try {
      const balance = await vaultContractRef.current.balanceOf(wallet.account)
      setCp(formatEther(BigNumber.from(balance)).toString())
    } catch (err) {
      console.log('getCp ', err)
    }
  }

  const getSolaceBalance = async () => {
    if (!solaceContractRef.current?.provider) return

    try {
      const balance = await solaceContractRef.current.balanceOf(wallet.account)
      setSolaceBalance(formatEther(BigNumber.from(balance)).toString())
    } catch (err) {
      console.log('getSolaceBalance ', err)
    }
  }

  const getNumFarms = async () => {
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.numFarms()
      setFarms(ans.toString())
    } catch (err) {
      console.log('getNumFarms ', err)
    }
  }

  const getTotalAssets = async () => {
    if (!vaultContractRef.current) return
    try {
      const ans = await vaultContractRef.current.totalAssets().then((ans: any) => {
        return ans
      })
      setAssets(formatEther(BigNumber.from(ans)).toString())
    } catch (err) {
      console.log('getTotalAssets ', err)
    }
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
      // const deadline = constants.MaxUint256
      // const nonce = await vaultContractRef.current.nonces(depositor1.address)
      // const approve = {
      //   owner: depositor1.address,
      //   spender: masterContractRef.current?.address,
      //   value: amount,
      // }
      // const digest = getPermitDigest(
      //   TOKEN_NAME,
      //   vaultContractRef.current.address,
      //   wallet.networkId ? wallet.networkId : 0,
      //   approve,
      //   nonce,
      //   deadline
      // )
      // const { v, r, s } = sign(digest, Buffer.from(depositor1.privateKey.slice(2), 'hex'))
      // await vaultContractRef.current.connect(depositor1).depositAndStake(0, deadline, v, r, s, { value: amount })
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
      <div>Farms: {farms}</div>
      <div>Farm value staked: {valueStaked}</div>
      <div>Total Assets: {assets}</div>
      <div>Rewards per day: {rewardsPerDay}</div>
      {wallet.isActive ? (
        !loading ? (
          <>
            <div>My rewards per day: {userRewardsPerDay}</div>
            <div>My rewards: {userRewards}</div>
            {/* <div>Account: {wallet.account}</div>
            <div>Chain Id: {wallet.networkId}</div>
            <div>Solace Balance: {solaceBalance}</div> */}
            <div>SCP Tokens: {cp}</div>
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
