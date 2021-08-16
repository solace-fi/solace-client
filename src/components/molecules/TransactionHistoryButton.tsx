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
import React from 'react'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { Button } from '../atoms/Button'
import { StyledHistory } from '../atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

import { GeneralElementProps } from '../generalInterfaces'

export const TransactionHistoryButton: React.FC<GeneralElementProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { localTransactions, openHistoryModal } = useCachedData()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button
        {...props}
        width={width >= MAX_MOBILE_SCREEN_WIDTH ? undefined : 50}
        onClick={() => openHistoryModal()}
        secondary={localTransactions.length > 0}
      >
        <StyledHistory size={30} />
        {localTransactions.length > 0 ? localTransactions.length : width >= MAX_MOBILE_SCREEN_WIDTH && 'History'}
      </Button>
    </>
  )
}
