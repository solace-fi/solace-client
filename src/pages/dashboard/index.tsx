import React, { useEffect, useState, useRef } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'
import { useBalance } from '../../hooks/useBalance'

import { BigNumber } from '@ethersproject/bignumber'

import Coins from '../../components/ui/Coins'

import { useReload } from '../../hooks/useReload'

import { useMasterContract, useVaultContract } from '../../hooks/useContract'
import { createSemanticDiagnosticsBuilderProgram } from 'typescript'

function Dashboard(): any {
  // const balance = useBalance()

  const wallet = useWallet()
  const status = wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>

  const [assets, setAssets] = useState<string>('0')
  // const [bal, setBal] = useState<number | null | undefined>(0)

  const [reload, version] = useReload()
  const [loading, setLoading] = useState<boolean>(false)

  const masterContractRef = useRef<Contract>()
  const vaultContractRef = useRef<Contract>()

  const master = useMasterContract()
  const vault = useVaultContract()

  useEffect(() => {
    vaultContractRef.current = vault
    masterContractRef.current = master
    totalAssets()
    // setBal(wallet.balance)
  }, [vault, master, wallet, version])

  // const fetchBalance = async () => {
  //   let stale = false

  //   wallet.library
  //     .getBalance(wallet.account)
  //     .then((balance: number) => {
  //       if (!stale) {
  //         setBal(balance)
  //       }
  //     })
  //     .catch(() => {
  //       if (!stale) {
  //         setBal(null)
  //       }
  //     })
  //   return () => {
  //     stale = true
  //     setBal(undefined)
  //   }
  // }

  const callDeposit = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    const amount = ethers.utils.parseEther((5).toString())
    try {
      const tx = await vaultContractRef.current.deposit({ value: amount })
      await tx.wait()
      totalAssets().then(() => wallet.fetchBalance())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const callWithdraw = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.withdraw(ethers.utils.parseEther((5).toString()), 3)
      await tx.wait()
      totalAssets().then(() => wallet.fetchBalance())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  const totalAssets = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const ans = await vaultContractRef.current.totalAssets()
      setAssets(formatEther(BigNumber.from(ans)).toString())
    } catch (err) {
      console.log('Error ', err)
    }
    setLoading(false)
  }

  return (
    <>
      {status}
      {!loading ? (
        <>
          <button onClick={callDeposit}>deposit</button>
          <button onClick={callWithdraw}>withdraw</button>
        </>
      ) : (
        <div>Loading</div>
      )}

      <div>totalAssets: {assets}</div>
      <Coins />
    </>
  )
}

export default Dashboard
