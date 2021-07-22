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
import { UserImage } from './index'
import { Heading3 } from '../Typography'
import { Button } from '../Button'
import { TransactionHistoryModal } from './TransactionHistoryModal'
import { StyledHistory } from '../Icon'
import { WalletConnectButton } from '../Button/WalletConnect'
import { SmallBox } from '../Box'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'

/* import utils */
import { shortenAddress, fixed, getNetworkName } from '../../utils/formatting'

export default function Account(): any {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { isActive, chainId, account } = useWallet()
  const balance = useNativeTokenBalance()
  const { localTransactions } = useCachedData()
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false)

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
              : `${getNetworkName(chainId).charAt(0).toUpperCase().concat(getNetworkName(chainId).slice(1))}`}
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
