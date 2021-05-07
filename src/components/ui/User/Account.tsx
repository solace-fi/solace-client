import React, { useState, useMemo, Fragment } from 'react'
import user from '../../../static/user-avatar.png'

import { useWallet } from '../../../context/Web3Manager'
import { formatEther } from '@ethersproject/units'
import { SUPPORTED_WALLETS } from '../../../ethers/wallets'
import { User, UserImage, UserWallet, UserName } from './index'

import { Button } from '../Button'

export default function App(): any {
  const wallet = useWallet()

  const [bal, setBal] = useState<number | null | undefined>(0)

  useMemo(() => {
    setBal(wallet.balance)
  }, [wallet.balance])

  return (
    <User>
      <UserImage>
        <img src={user} alt="User Name" />
      </UserImage>
      {/* <>
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
        </>{' '} */}
      <UserWallet>
        {wallet.isActive ? (
          bal ? (
            `${formatEther(bal)} ETH`
          ) : (
            ''
          )
        ) : (
          <Button
            onClick={() =>
              wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
            }
          >
            Connect Wallet
          </Button>
        )}
      </UserWallet>
      {wallet.isActive ? (
        <Fragment>
          <UserName>{wallet.account}</UserName>{' '}
          {/* <Button onClick={() => wallet.disconnect()}>Disconnect MetaMask Wallet</Button> */}
        </Fragment>
      ) : null}
    </User>
  )
}
