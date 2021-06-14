/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import hooks
    import wallet
    import utils
    import static

    Account function
      Hook variables
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import makeBlockie from 'ethereum-blockies-base64'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { User, UserImage, UserWallet, UserName } from './index'
import { Button } from '../Button'
import { Heading3 } from '../Text'

/* import hooks */
import { useEthBalance } from '../../hooks/useEthBalance'

/* import wallet */
import { SUPPORTED_WALLETS } from '../../wallet/wallets'

/* import utils */
import { shortenAddress, fixed } from '../../utils/formatting'
import { getNetworkName } from '../../utils'

/* import static */
import user from '../../static/user-avatar.png'
import { WalletConnectButton } from '../Button/WalletConnect'

export default function Account(): any {
  /*************************************************************************************

  Hook variables

  *************************************************************************************/
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
            <WalletConnectButton />
          )}
        </UserWallet>
        {wallet.account && <UserName>{shortenAddress(wallet.account)}</UserName>}
      </User>
    </Fragment>
  )
}
