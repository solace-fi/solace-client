import React from 'react'
import { TransactionCondition } from '../../constants/enums'
import { useWallet } from '../../context/WalletManager'
import { Loader } from '../Loader/Loader'
import { HyperLink } from '../Link'
import { Button } from '../Button'
import { ToastWrapper, FlexedToastMessage } from '.'

import { getExplorerItemUrl } from '../../utils/explorer'
import { ExplorerscanApi } from '../../constants/enums'

import { StyledCheckmark, StyledWarning } from '../Icon'
import { DEFAULT_CHAIN_ID } from '../../constants'

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
  return (
    <ToastWrapper>
      {icon}
      <FlexedToastMessage>{message}</FlexedToastMessage>
    </ToastWrapper>
  )
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, condition, cond, txHash }) => {
  const { chainId } = useWallet()

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
