import React from 'react'
import styled from 'styled-components'
import { TransactionCondition } from '../../constants/enums'
import { useWallet } from '../../context/WalletManager'
import { Loader } from '../Loader'
import { HyperLink } from '../Link'
import { Button } from '../Button'

import { getExplorerItemUrl } from '../../utils/explorer'
import { ExplorerscanApi } from '../../constants/enums'

import { StyledCheckmark, StyledWarning } from '../Icon'

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

const FlexedMessage = styled.div`
  margin-top: 10px;
  margin-right: 0px;
  margin-bottom: 10px;
  margin-left: 0px;
  display: flex;
`

const ToastWrapper = styled.div`
  text-align: center;
`

export const AppToast: React.FC<AppToastProps> = ({ message, icon }) => {
  return (
    <ToastWrapper>
      {icon}
      <FlexedMessage>{message}</FlexedMessage>
    </ToastWrapper>
  )
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, condition, cond, txHash }) => {
  const { chainId } = useWallet()

  return (
    <ToastWrapper>
      <FlexedMessage>
        {message}: Transaction {cond}
      </FlexedMessage>
      <FlexedMessage>
        {txHash && (
          <HyperLink
            href={getExplorerItemUrl(chainId, txHash, ExplorerscanApi.TX)}
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
      </FlexedMessage>
    </ToastWrapper>
  )
}
