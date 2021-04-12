import { NavLink } from 'react-router-dom'
import React, { Fragment, useState, useEffect } from 'react'

import { useBalance } from '../../../hooks/useBalance'
import { useWallet } from '../../../context/Web3Manager'

import { formatEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../../ethers/wallets'

export const Navbar = () => {
  const balance = useBalance()
  const wallet = useWallet()

  const [bal, setBal] = useState<number | null | undefined>(0)

  useEffect(() => {
    setBal(balance)
  }, [balance])

  return (
    <Fragment>
      <NavLink className="dashboard-nav-link" to={'/'}>
        Dashboard
      </NavLink>
      <NavLink className="invest-nav-link" to={'/invest'}>
        Invest
      </NavLink>
      <NavLink className="quote-nav-link" to={'/quote'}>
        Quote
      </NavLink>
      <>
        {wallet.isActive ? (
          <>
            <div>Your balance is {`Ξ${bal ? formatEther(bal) : ''}`}</div>
            <button onClick={() => wallet.disconnect()}>Disconnect MetaMask Wallet</button>
          </>
        ) : (
          <>
            <div>Disconnected, please connect wallet</div>
            <button
              onClick={() =>
                wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
              }
            >
              Connect MetaMask Wallet
            </button>
          </>
        )}{' '}
      </>{' '}
    </Fragment>
  )
}

export default Navbar
