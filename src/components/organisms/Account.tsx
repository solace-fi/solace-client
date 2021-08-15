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
import { Button } from '../atoms/Button'
import { Heading3 } from '../atoms/Typography'
import { SmallBox } from '../atoms/Box'
import { StyledHistory } from '../atoms/Icon'
import { UserImage } from '../atoms/User'
import { WalletConnectButton } from '../molecules/WalletConnect'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { shortenAddress, fixed, capitalizeFirstLetter } from '../../utils/formatting'

export const Account: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { isActive, chainId, account } = useWallet()
  const balance = useNativeTokenBalance()
  const { localTransactions, openHistoryModal } = useCachedData()
  const { width } = useWindowDimensions()
  const { activeNetwork, findNetworkByChainId } = useNetwork()

  /*************************************************************************************

  Render
  
  *************************************************************************************/

  return (
    <Fragment>
      {width >= MAX_MOBILE_SCREEN_WIDTH && isActive && (
        <SmallBox navy>
          <Heading3 autoAlign>
            {findNetworkByChainId(chainId) ? `${capitalizeFirstLetter(activeNetwork.name)}` : `-`}
          </Heading3>
        </SmallBox>
      )}
      {account && (
        <Fragment>
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
          <SmallBox p={0} transparent glow={localTransactions.length > 0}>
            <Button
              width={width >= MAX_MOBILE_SCREEN_WIDTH ? undefined : 50}
              pl={10}
              pr={10}
              onClick={() => openHistoryModal()}
              secondary={localTransactions.length > 0}
            >
              <StyledHistory size={30} />
              {localTransactions.length > 0 ? localTransactions.length : width >= MAX_MOBILE_SCREEN_WIDTH && 'History'}
            </Button>
          </SmallBox>
        </Fragment>
      )}
      <WalletConnectButton ml={5} mr={5} />
    </Fragment>
  )
}
