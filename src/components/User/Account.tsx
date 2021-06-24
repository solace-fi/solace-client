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
import { shortenAddress, fixed, truncateBalance } from '../../utils/formatting'
import { getNetworkName } from '../../utils'

/* import static */
import user from '../../static/user-avatar.png'
import { WalletConnectButton } from '../Button/WalletConnect'
import { SmallBox } from '../Box'

export default function Account(): any {
  /*************************************************************************************

  Hook variables

  *************************************************************************************/
  const wallet = useWallet()
  const balance = useEthBalance()

  return (
    <Fragment>
      {wallet.isActive && (
        <SmallBox outlined>
          <Heading3 alignVertical>
            {getNetworkName(wallet.chainId) === '-'
              ? getNetworkName(wallet.chainId)
              : `${getNetworkName(wallet.chainId)
                  .charAt(0)
                  .toUpperCase()
                  .concat(getNetworkName(wallet.chainId).slice(1))}`}
          </Heading3>
        </SmallBox>
      )}
      {!wallet.isActive && <WalletConnectButton />}
      {wallet.account && (
        <SmallBox pl={10} outlined>
          <Heading3 alignVertical>{balance ? `${fixed(parseFloat(balance), 3)} ETH` : ''}</Heading3>
          <SmallBox ml={10} outlined>
            <Heading3 alignVertical>{shortenAddress(wallet.account)}</Heading3>{' '}
            <UserImage pt={4} pb={4} pl={10}>
              <img src={makeBlockie(wallet.account)} />
            </UserImage>
          </SmallBox>
        </SmallBox>
      )}
    </Fragment>
  )
}
