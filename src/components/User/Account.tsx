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
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import packages */
import styled from 'styled-components'
import makeBlockie from 'ethereum-blockies-base64'
import { History } from '@styled-icons/boxicons-regular/History'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'

/* import components */
import { UserImage } from './index'
import { Heading3 } from '../Text'
import { Button } from '../Button'
import { TransactionHistoryModal } from './TransactionHistoryModal'

/* import hooks */
import { useEthBalance } from '../../hooks/useEthBalance'

/* import utils */
import { shortenAddress, fixed } from '../../utils/formatting'
import { getNetworkName } from '../../utils'

/* import static */
import { WalletConnectButton } from '../Button/WalletConnect'
import { SmallBox } from '../Box'

const StyledHistory = styled(History)`
  display: block;
`

export default function Account(): any {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const wallet = useWallet()
  const balance = useEthBalance()
  const { localTransactions } = useUserData()
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false)

  const openModal = () => {
    document.body.style.overflowY = 'hidden'
    setShowHistoryModal(true)
  }

  const closeModal = () => {
    document.body.style.overflowY = 'scroll'
    setShowHistoryModal(false)
  }

  return (
    <Fragment>
      <TransactionHistoryModal closeModal={closeModal} isOpen={showHistoryModal} />
      {wallet.isActive && (
        <SmallBox navy>
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
        <Fragment>
          <SmallBox pl={10} navy>
            <Heading3 autoAlign nowrap>
              {balance ? `${fixed(parseFloat(balance), 3)} ETH` : ''}
            </Heading3>
            <SmallBox ml={10} navy>
              <Heading3 autoAlign>{shortenAddress(wallet.account)}</Heading3>{' '}
              <UserImage pt={4} pb={4} pl={10}>
                <img src={makeBlockie(wallet.account)} />
              </UserImage>
            </SmallBox>
          </SmallBox>
          <SmallBox p={0} transparent>
            <Button
              pl={10}
              pr={10}
              onClick={() => openModal()}
              secondary={localTransactions ? localTransactions.length > 0 : false}
            >
              <StyledHistory size={30} />
              {localTransactions && localTransactions.length > 0 ? localTransactions.length : 'History'}
            </Button>
          </SmallBox>
        </Fragment>
      )}
    </Fragment>
  )
}
