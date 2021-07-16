import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { getEtherscanTxUrl } from '../utils/etherscan'
import { toast, ToastContainer } from 'react-toastify'
import { useWallet } from '../context/WalletManager'
import { contractConfig } from '../config/chainConfig'

import 'animate.css/animate.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { DEFAULT_CHAIN_ID } from '../constants'
import { TransactionCondition, Error } from '../constants/enums'
import { HyperLink } from '../components/Link'
import { Button } from '../components/Button'

import '../styles/toast.css'
import styled from 'styled-components'
import { Loader } from '../components/Loader'
import { Checkmark } from '@styled-icons/evaicons-solid/Checkmark'
import { Warning } from '@styled-icons/fluentui-system-regular/Warning'
/*
This manager allows for notifications to be created. such notifications can be created
on trigger or manually. Error are also tracked so appropriate notifications can be shown but 
they can also be used elsewhere in the app for other purposes, such as disabling a certain feature
if an error occurs.
*/

const FlexDiv = styled.div`
  margin-top: 10px;
  margin-right: 0px;
  margin-bottom: 10px;
  margin-left: 0px;
  display: flex;
`

const StyledCheckmark = styled(Checkmark)`
  margin: auto;
  display: block;
`

const StyledWarning = styled(Warning)`
  margin: auto;
  display: block;
`

const StyledToast = styled.div`
  text-align: center;
`

type ToastSystem = {
  makeTxToast: (txType: string, condition: TransactionCondition, txHash?: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  makeTxToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const wallet = useWallet()
  const [errors, setErrors] = useState<Error[]>([])

  const makeTxToast = (txType: string, condition?: TransactionCondition, txHash?: string) => {
    const TxToast = (message: any, cond?: any) => (
      <StyledToast>
        <FlexDiv>
          {message}: Transaction {cond}
        </FlexDiv>
        <FlexDiv>
          {txHash && (
            <HyperLink
              href={getEtherscanTxUrl(wallet.chainId ?? DEFAULT_CHAIN_ID, txHash)}
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
        </FlexDiv>
      </StyledToast>
    )
    switch (condition) {
      case 'Complete':
        if (txHash) {
          if (toast.isActive(txHash)) {
            toast.update(txHash, {
              render: TxToast(txType, 'successful'),
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              closeOnClick: false,
              closeButton: true,
              className: 'success-toast',
            })
          } else {
            toast(TxToast(txType, 'successful'), {
              toastId: txHash,
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              closeOnClick: false,
              closeButton: true,
              className: 'success-toast',
            })
          }
        }
        break
      case 'Incomplete':
        if (txHash) {
          if (toast.isActive(txHash)) {
            toast.update(txHash, {
              render: TxToast(txType, 'failed'),
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              closeOnClick: false,
              closeButton: true,
              className: 'error-toast',
            })
          } else {
            toast(TxToast(txType, 'failed'), {
              toastId: txHash,
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              closeOnClick: false,
              closeButton: true,
              className: 'error-toast',
            })
          }
        }
        break
      case 'Pending':
        if (txHash) {
          toast(TxToast(txType, 'pending'), {
            toastId: txHash,
            type: toast.TYPE.INFO,
            autoClose: false,
            position: toast.POSITION.BOTTOM_LEFT,
            closeOnClick: false,
            closeButton: true,
            className: 'info-toast',
          })
        }
        break
      default:
        toast(TxToast(txType, 'cancelled'), {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 10000,
          closeOnClick: false,
          closeButton: true,
          className: 'error-toast',
        })
    }
  }

  const appToast = (message: string, icon?: any) => (
    <StyledToast>
      {icon}
      <FlexDiv>{message}</FlexDiv>
    </StyledToast>
  )

  // Removes toasts from display on chainId or account change
  useEffect(() => {
    toast.dismiss()
  }, [wallet.chainId, wallet.account])

  // Runs whenever the chainId changes
  useEffect(() => {
    console.log(wallet.errors)
    if (!wallet.errors) return
    if (wallet.errors.includes(Error.UNSUPPORTED_NETWORK)) {
      toast(appToast(`Unsupported network, please switch to a supported network`, <StyledWarning size={30} />), {
        toastId: Error.UNSUPPORTED_NETWORK,
        type: toast.TYPE.ERROR,
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: 'error-toast',
      })
    } else {
      toast.dismiss(Error.UNSUPPORTED_NETWORK)
    }
    if (wallet.errors.includes(Error.NO_ETH_PROVIDER)) {
      toast(appToast(`No Ethereum browser extension detected`, <StyledWarning size={30} />), {
        toastId: Error.NO_ETH_PROVIDER,
        type: toast.TYPE.ERROR,
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: 'error-toast',
      })
    } else {
      toast.dismiss(Error.NO_ETH_PROVIDER)
    }
    if (wallet.errors.includes(Error.NO_ACCESS)) {
      toast(appToast(`Please authorize this website to access your Ethereum account`, <StyledWarning size={30} />), {
        toastId: Error.NO_ACCESS,
        type: toast.TYPE.ERROR,
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: 'error-toast',
      })
    } else {
      toast.dismiss(Error.NO_ACCESS)
    }
    if (wallet.errors.includes(Error.UNKNOWN)) {
      toast(appToast(`An unknown error occurred`, <StyledWarning size={30} />), {
        toastId: Error.UNKNOWN,
        type: toast.TYPE.ERROR,
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: 'error-toast',
      })
    } else {
      toast.dismiss(Error.UNKNOWN)
    }
  }, [wallet.errors])

  const value = useMemo<ToastSystem>(
    () => ({
      makeTxToast: makeTxToast,
    }),
    [wallet]
  )

  return (
    <ToastsContext.Provider value={value}>
      <ToastContainer />
      {props.children}
    </ToastsContext.Provider>
  )
}

// To get access to this Manager, import this into your component or hook
export function useToasts(): ToastSystem {
  return useContext(ToastsContext)
}

const NotificationsManager: React.FC = (props) => {
  return <ToastsProvider>{props.children}</ToastsProvider>
}

export default NotificationsManager
