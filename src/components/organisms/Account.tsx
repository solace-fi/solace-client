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
import React, { Fragment, useCallback, useState } from 'react'

/* import packages */
import makeBlockie from 'ethereum-blockies-base64'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { Button } from '../atoms/Button'
import { Heading3 } from '../atoms/Typography'
import { SmallBox } from '../atoms/Box'
import { StyledHistory } from '../atoms/Icon'
import { TransactionHistoryModal } from './TransactionHistoryModal'
import { UserImage } from '../atoms/User'
import { WalletConnectButton } from '../molecules/WalletConnect'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'

/* import utils */
import { shortenAddress, fixed, getNetworkName, capitalizeFirstLetter } from '../../utils/formatting'

export const Account: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { isActive, chainId, account } = useWallet()
  const balance = useNativeTokenBalance()
  const { localTransactions } = useCachedData()
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false)

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setShowHistoryModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setShowHistoryModal(false)
  }, [])

  /*************************************************************************************

  Render
  
  *************************************************************************************/

  return (
    <Fragment>
      <TransactionHistoryModal closeModal={closeModal} isOpen={showHistoryModal} />
      {isActive && (
        <SmallBox navy>
          <Heading3 autoAlign>
            {getNetworkName(chainId) === '-'
              ? getNetworkName(chainId)
              : `${capitalizeFirstLetter(getNetworkName(chainId))}`}
          </Heading3>
        </SmallBox>
      )}
      {!isActive && <WalletConnectButton />}
      {account && (
        <Fragment>
          <SmallBox pl={10} navy>
            <Heading3 autoAlign nowrap>
              {balance ? `${fixed(parseFloat(balance), 3)} ETH` : ''}
            </Heading3>
            <SmallBox ml={10} navy>
              <Heading3 autoAlign>{shortenAddress(account)}</Heading3>{' '}
              <UserImage pt={4} pb={4} pl={10}>
                <img src={makeBlockie(account)} />
              </UserImage>
            </SmallBox>
          </SmallBox>
          <SmallBox p={0} transparent glow={localTransactions.length > 0}>
            <Button pl={10} pr={10} onClick={() => openModal()} secondary={localTransactions.length > 0}>
              <StyledHistory size={30} />
              {localTransactions.length > 0 ? localTransactions.length : 'History'}
            </Button>
          </SmallBox>
        </Fragment>
      )}
    </Fragment>
  )
}
