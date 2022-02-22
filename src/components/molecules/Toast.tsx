/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import utils

    AppToast
      
    NotificationToast
      custom hooks
      local functions

  *************************************************************************************/

/* import packages */
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
import { ToastWrapper, FlexedToastMessage } from '../atoms/Message'
import { StyledCheckmark, StyledWarning, StyledInfo } from '../atoms/Icon'
import { Text, TextSpan } from '../atoms/Typography'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'

/* import resources */
import quantstampPdf from '../../resources/pdf/Solace-Quantstamp-Report.pdf'
import { CopyButton } from './CopyButton'

interface AppToastProps {
  message: string
  icon: any
}

interface NotificationToastProps {
  txType: string
  condition: TransactionCondition
  txHash?: string
  errObj?: any
}

export const AppToast: React.FC<AppToastProps> = ({ message, icon }) => {
  return (
    <ToastWrapper>
      {icon}
      <FlexedToastMessage light>{message}</FlexedToastMessage>
    </ToastWrapper>
  )
}

export const AuditToast: React.FC = () => {
  return (
    <ToastWrapper>
      <StyledInfo size={30} />
      <FlexedToastMessage>
        <Text t3 regular light>
          solace.fi has been audited by{' '}
          <HyperLink
            href={'https://hacken.io/audits/#solace'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgb(250, 250, 250)', textDecoration: 'underline' }}
          >
            {' '}
            Hacken
          </HyperLink>{' '}
          and{' '}
          <HyperLink
            href={quantstampPdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgb(250, 250, 250)', textDecoration: 'underline' }}
          >
            {' '}
            Quantstamp
          </HyperLink>
          . However, it is still experimental software.
        </Text>
      </FlexedToastMessage>
    </ToastWrapper>
  )
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ txType, condition, txHash, errObj }) => {
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
        {txType}: Transaction {getStateFromCondition(condition)}
      </FlexedToastMessage>
      {errObj && (
        <FlexedToastMessage light>
          <Text t4 light>
            {errObj.message && errObj.code ? (
              <>
                <TextSpan t4 light bold>
                  ({errObj.code})
                </TextSpan>{' '}
                {errObj.message.length > 120 ? `${errObj.message.substring(0, 120)}...` : errObj.message}
              </>
            ) : (
              'Unknown error, please check full error log'
            )}
          </Text>
        </FlexedToastMessage>
      )}
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
        {errObj && (
          <CopyButton
            toCopy={
              errObj.message && errObj.code
                ? JSON.stringify({ code: errObj.code, message: errObj.message })
                : JSON.stringify(errObj)
            }
            objectName={'Error Log'}
          />
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
