import { NavLink } from 'react-router-dom'
import React, { Fragment, useState, useEffect, useMemo } from 'react'

import { useWallet } from '../../../context/Web3Manager'

import { formatEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../../ethers/wallets'

export const Navbar = () => {
  const wallet = useWallet()

  const [bal, setBal] = useState<number | null | undefined>(0)

  useMemo(() => {
    setBal(wallet.balance)
  }, [wallet.balance])

  return (
    <Fragment>
      <NavLink className="dashboard-nav-link" to={'/dashboard'}>
        Dashboard
      </NavLink>
      <NavLink className="invest-nav-link" to={'/invest'}>
        Invest
      </NavLink>
      <NavLink className="quote-nav-link" to={'/quote'}>
        Quote
      </NavLink>
      <NavLink className="playground-nav-link" to={'/'}>
        Playground
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
