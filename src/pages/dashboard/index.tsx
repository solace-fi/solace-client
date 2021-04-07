import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'
import { useBalance } from '../../hooks/useBalance'
import { useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../wallets'

import { useWallet } from '../../context/Web3Manager'

function Dashboard(): any {
  const masterContract = useMasterContract('0x00000000', false)
  const balance = useBalance()
  const { active } = useWeb3React()
  const wallet = useWallet()
  const dashboard = active ? (
    <>
      <div>Dashboard, your balance is {`Ξ${balance ? formatEther(balance) : ''}`}</div>
      <button onClick={() => wallet.disconnect()}>Disconnect MetaMask Wallet</button>
    </>
  ) : (
    <>
      <div>Dashboard, please connect wallet</div>
      <button
        onClick={() =>
          wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
        }
      >
        Connect MetaMask Wallet
      </button>
    </>
  )
  return dashboard
}

export default Dashboard
