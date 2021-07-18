import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useWallet } from '../context/WalletManager'

import 'animate.css/animate.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { TransactionCondition, Error } from '../constants/enums'

import '../styles/toast.css'
import { AppToast, NotificationToast } from '../components/Toast'
import { StyledWarning } from '../components/Icon'

/*
This manager allows for notifications to be created. such notifications can be created
on trigger or manually. Error are also tracked so appropriate notifications can be shown but 
they can also be used elsewhere in the app for other purposes, such as disabling a certain feature
if an error occurs.
*/

type ToastSystem = {
  makeTxToast: (txType: string, condition: TransactionCondition, txHash?: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  makeTxToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const wallet = useWallet()

  const makeTxToast = (txType: string, condition: TransactionCondition, txHash?: string) => {
    const TxToast = (message: string, cond: string) => (
      <NotificationToast message={message} condition={condition} cond={cond} txHash={txHash} />
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

  const appToast = (message: string, icon: any) => <AppToast message={message} icon={icon} />

  // Removes toasts from display on chainId or account change
  useEffect(() => {
    toast.dismiss()
  }, [wallet.chainId, wallet.account])

  // Runs whenever the chainId changes
  useEffect(() => {
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
