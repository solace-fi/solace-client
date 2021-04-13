import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'

import { useMasterContract, useVaultContract } from '../../hooks/useContract'

function Dashboard(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>

  const [assets, setAssets] = useState<string>('0')
  const [farms, setFarms] = useState<string>('1')
  const [amount, setAmount] = useState<number>(5)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()

  const master = useMasterContract()
  const vault = useVaultContract()

  const callDeposit = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await tx.wait()
      totalAssets()
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
      totalAssets()
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

  useMemo(() => {
    console.log('setting contracts', vault, master)
    vaultContractRef.current = vault
    masterContractRef.current = master
    totalAssets()
    numFarms()
  }, [vault, master])

  return (
    <>
      {status}
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
            <button onClick={callDeposit}>deposit</button>
            <button onClick={callWithdraw}>withdraw</button>
          </>
        ) : (
          <div>Loading</div>
        )
      ) : null}
      <Coins />
    </>
  )
}

export default Dashboard
