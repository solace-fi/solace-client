/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import utils

    AppToast
      
    NotificationToast
      custom hooks
      local functions

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { ExplorerscanApi } from '../../constants/enums'
import { TransactionCondition } from '../../constants/enums'

/* import components */
import { Loader } from '../atoms/Loader'
import { HyperLink } from '../atoms/Link'
import { Button } from '../atoms/Button'
import { ToastWrapper, FlexedToastMessage } from '../atoms/Toast'
import { StyledCheckmark, StyledWarning } from '../atoms/Icon'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'

interface AppToastProps {
  message: string
  icon: any
}

interface NotificationToastProps {
  message: string
  condition: TransactionCondition
  txHash?: string
}

export const AppToast: React.FC<AppToastProps> = ({ message, icon }) => {
  return (
    <ToastWrapper>
      {icon}
      <FlexedToastMessage light>{message}</FlexedToastMessage>
    </ToastWrapper>
  )
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, condition, txHash }) => {
  /*************************************************************************************

   custom hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()

  /*************************************************************************************

   Local functions

  *************************************************************************************/

  const getStateFromCondition = (condition: TransactionCondition): string => {
    switch (condition) {
      case TransactionCondition.SUCCESS:
        return 'successful'
      case TransactionCondition.FAILURE:
        return 'failed'
      case TransactionCondition.PENDING:
        return 'pending'
      case TransactionCondition.CANCELLED:
      default:
        return 'cancelled'
    }
  }

  return (
    <ToastWrapper>
      <FlexedToastMessage light>
        {message}: Transaction {getStateFromCondition(condition)}
      </FlexedToastMessage>
      <FlexedToastMessage light>
        {txHash && (
          <HyperLink
            href={getExplorerItemUrl(activeNetwork.explorer.url, txHash, ExplorerscanApi.TX)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button light>Check on {activeNetwork.explorer.name}</Button>
          </HyperLink>
        )}
        {condition == TransactionCondition.PENDING ? (
          <Loader width={10} height={10} isLight />
        ) : condition == TransactionCondition.SUCCESS ? (
          <StyledCheckmark size={30} />
        ) : (
          <StyledWarning size={30} />
        )}
      </FlexedToastMessage>
    </ToastWrapper>
  )
}
