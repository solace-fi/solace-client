import React, { useEffect, useState, useRef } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { ethers } from 'ethers'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'

import { useMasterContract, useVaultContract } from '../../hooks/useContract'

function Dashboard(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>

  const [assets, setAssets] = useState<string>('')

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()

  const master = useMasterContract()
  const vault = useVaultContract()

  useEffect(() => {
    vaultContractRef.current = vault
    masterContractRef.current = master
    totalAssets()
  }, [vault, master, wallet])

  const callDeposit = async () => {
    const amount = ethers.utils.parseEther((5).toString())
    if (!vaultContractRef.current) return
    try {
      const tx = await vaultContractRef.current.deposit({ value: amount })
      await tx.wait()
      console.log(tx)
      totalAssets()
    } catch (err) {
      console.log('Error ', err)
    }
  }

  const totalAssets = async () => {
    if (!vaultContractRef.current) return

    try {
      const ans = await vaultContractRef.current.totalAssets()
      setAssets(BigNumber.from(ans).toString())
    } catch (err) {
      console.log('Error ', err)
    }
  }

  return (
    <>
      {status}
      <button onClick={callDeposit}>deposit</button>
      <div>totalAssets: {assets}</div>
      <Coins />
    </>
  )
}

export default Dashboard
