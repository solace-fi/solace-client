/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import utils

    AppToast function
      Render
    NotificationToast function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { ExplorerscanApi } from '../../constants/enums'
import { DEFAULT_CHAIN_ID } from '../../constants'
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
  cond: string
  txHash?: string
}

export const AppToast: React.FC<AppToastProps> = ({ message, icon }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <ToastWrapper>
      {icon}
      <FlexedToastMessage>{message}</FlexedToastMessage>
    </ToastWrapper>
  )
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, condition, cond, txHash }) => {
  /*************************************************************************************

   custom hooks

  *************************************************************************************/
  const { chainId } = useWallet()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <ToastWrapper>
      <FlexedToastMessage>
        {message}: Transaction {cond}
      </FlexedToastMessage>
      <FlexedToastMessage>
        {txHash && (
          <HyperLink
            href={getExplorerItemUrl(chainId ?? DEFAULT_CHAIN_ID, txHash, ExplorerscanApi.TX)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Check on Etherscan</Button>
          </HyperLink>
        )}
        {condition == TransactionCondition.PENDING ? (
          <Loader width={10} height={10} />
        ) : condition == TransactionCondition.SUCCESS ? (
          <StyledCheckmark size={30} />
        ) : (
          <StyledWarning size={30} />
        )}
      </FlexedToastMessage>
    </ToastWrapper>
  )
}
