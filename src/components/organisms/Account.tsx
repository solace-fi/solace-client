/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import hooks
    import utils

    Account function
      custom hooks
      local functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import makeBlockie from 'ethereum-blockies-base64'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Heading3 } from '../atoms/Typography'
import { SmallBox } from '../atoms/Box'
import { UserImage } from '../atoms/User'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { TransactionHistoryButton } from '../molecules/TransactionHistoryButton'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'

/* import utils */
import { shortenAddress, fixed } from '../../utils/formatting'
import { NetworkConnectButton } from '../molecules/NetworkConnectButton'

export const UserAccount: React.FC = () => {
  const { account } = useWallet()
  const balance = useNativeTokenBalance()
  const { activeNetwork } = useNetwork()

  return (
    <>
      {account && (
        <>
          <SmallBox pl={10} navy>
            <Heading3 autoAlign nowrap>
              {balance ? `${fixed(parseFloat(balance), 3)} ${activeNetwork.nativeCurrency.symbol}` : ''}
            </Heading3>
            <SmallBox ml={10} navy>
              <Heading3 autoAlign>{shortenAddress(account)}</Heading3>{' '}
              <UserImage pt={4} pb={4} pl={10}>
                <img src={makeBlockie(account)} />
              </UserImage>
            </SmallBox>
          </SmallBox>
        </>
      )}
    </>
  )
}

export const Account: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { localTransactions } = useCachedData()
  const { account } = useWallet()

  /*************************************************************************************

  Render
  
  *************************************************************************************/

  return (
    <Fragment>
      <UserAccount />
      <SmallBox p={0} transparent>
        <NetworkConnectButton pl={10} pr={10} />
      </SmallBox>
      <SmallBox p={0} transparent>
        <WalletConnectButton pl={10} pr={10} />
      </SmallBox>
      {account && (
        <SmallBox p={0} transparent glow={localTransactions.length > 0}>
          <TransactionHistoryButton pl={10} pr={10} />
        </SmallBox>
      )}
    </Fragment>
  )
}
