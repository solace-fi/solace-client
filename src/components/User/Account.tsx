import React, { Fragment } from 'react'
import user from '../../static/user-avatar.png'
import makeBlockie from 'ethereum-blockies-base64'

import { useWallet } from '../../context/WalletManager'
import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { User, UserImage, UserWallet, UserName } from './index'
import { useEthBalance } from '../../hooks/useEthBalance'
import { shortenAddress, fixed } from '../../utils/formatting'

import { Button } from '../Button'
import { getNetworkName } from '../../utils'
import { Heading3 } from '../Text'

export default function App(): any {
  const wallet = useWallet()
  const balance = useEthBalance()

  return (
    <Fragment>
      {wallet.isActive && (
        <Heading3
          style={{
            height: '30px',
            lineHeight: '30px',
            textAlign: 'center',
            padding: '2px 16px',
            margin: '0 10px 0 10px',
            border: '1px solid #fff',
            borderRadius: '10px',
          }}
        >
          {getNetworkName(wallet.chainId) === '-'
            ? getNetworkName(wallet.chainId)
            : `Connected to ${getNetworkName(wallet.chainId)
                .charAt(0)
                .toUpperCase()
                .concat(getNetworkName(wallet.chainId).slice(1))}`}
        </Heading3>
      )}
      <User>
        <UserImage>{wallet.account ? <img src={makeBlockie(wallet.account)} /> : <img src={user} />}</UserImage>
        <UserWallet>
          {wallet.isActive ? (
            <Fragment>{balance ? `${fixed(parseFloat(balance), 6)} ETH` : ''}</Fragment>
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
        {wallet.account && <UserName>{shortenAddress(wallet.account)}</UserName>}
      </User>
    </Fragment>
  )
}
