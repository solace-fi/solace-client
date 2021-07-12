/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import hooks
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
import { UserImage } from './index'
import { Heading3 } from '../Text'

/* import hooks */
import { useEthBalance } from '../../hooks/useEthBalance'

/* import utils */
import { shortenAddress, fixed } from '../../utils/formatting'
import { getNetworkName } from '../../utils'

/* import static */
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
          <Heading3 autoAlign>
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
          <Heading3 autoAlign nowrap>
            {balance ? `${fixed(parseFloat(balance), 3)} ETH` : ''}
          </Heading3>
          <SmallBox ml={10} outlined>
            <Heading3 autoAlign>{shortenAddress(wallet.account)}</Heading3>{' '}
            <UserImage pt={4} pb={4} pl={10}>
              <img src={makeBlockie(wallet.account)} />
            </UserImage>
          </SmallBox>
        </SmallBox>
      )}
    </Fragment>
  )
}
