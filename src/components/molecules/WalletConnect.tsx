/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import wallets
    import hooks

    styled components

    WalletConnectButton function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../atoms/Button'
import { StyledWallet } from '../atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

import { GeneralElementProps } from '../generalInterfaces'

export const WalletConnectButton: React.FC<GeneralElementProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { isActive, openWalletModal } = useWallet()
  const { width } = useWindowDimensions()

  const openModal = useCallback(() => {
    openWalletModal()
  }, [])

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button width={width >= MAX_MOBILE_SCREEN_WIDTH ? undefined : 50} onClick={() => openModal()} {...props}>
        <StyledWallet size={30} />
        {width >= MAX_MOBILE_SCREEN_WIDTH && (isActive ? 'Switch Wallet' : 'Connect Wallet')}
      </Button>
    </>
  )
}
