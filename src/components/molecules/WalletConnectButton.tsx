/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import hooks

    styled components

    WalletConnectButton function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledWallet } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

export const WalletConnectButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { isActive, openWalletModal } = useWallet()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button width={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 50} onClick={() => openWalletModal()} {...props}>
        <StyledWallet size={30} />
        {isActive ? 'Switch Wallet' : 'Connect Wallet'}
      </Button>
    </>
  )
}
