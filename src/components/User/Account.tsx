import React, { Fragment } from 'react'
import user from '../../static/user-avatar.png'
import makeBlockie from 'ethereum-blockies-base64'

import { useWallet } from '../../context/WalletManager'
import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { User, UserImage, UserWallet, UserName } from './index'
import { useEthBalance } from '../../hooks/useEthBalance'
import { shortenAddress, fixed } from '../../utils/formatting'

import { Button } from '../Button'

export default function App(): any {
  const wallet = useWallet()
  const balance = useEthBalance()

  return (
    <User>
      <UserImage>{wallet.account ? <img src={makeBlockie(wallet.account)} /> : <img src={user} />}</UserImage>
      <UserWallet>
        {wallet.isActive ? (
          balance ? (
            `${fixed(parseFloat(balance), 6)} ETH`
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
      {wallet.account ? (
        <Fragment>
          <UserName>{shortenAddress(wallet.account)}</UserName>
          {/* <Button onClick={() => wallet.disconnect()}>Disconnect MetaMask Wallet</Button> */}
        </Fragment>
      ) : null}
    </User>
  )
}
