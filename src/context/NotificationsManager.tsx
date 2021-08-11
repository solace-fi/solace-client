import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useWallet } from '../context/WalletManager'

import 'animate.css/animate.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { TransactionCondition, Error } from '../constants/enums'

import '../styles/toast.css'
import { StylizedToastContainer } from '../components/atoms/Toast'
import { AppToast, NotificationToast } from '../components/molecules/Toast'
import { StyledWarning } from '../components/atoms/Icon'

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

const txSuccess = {
  autoClose: 10000,
  type: toast.TYPE.SUCCESS,
  position: toast.POSITION.BOTTOM_LEFT,
  closeOnClick: false,
  closeButton: true,
  className: 'success-toast',
}

const txError = {
  autoClose: 10000,
  type: toast.TYPE.ERROR,
  position: toast.POSITION.BOTTOM_LEFT,
  closeOnClick: true,
  closeButton: true,
  className: 'error-toast',
}

const appError: any = {
  type: toast.TYPE.ERROR,
  position: toast.POSITION.BOTTOM_LEFT,
  autoClose: false,
  closeOnClick: true,
  closeButton: true,
  className: 'error-toast',
}

const ToastsProvider: React.FC = (props) => {
  const { chainId, account, errors } = useWallet()

  const makeTxToast = (txType: string, condition: TransactionCondition, txHash?: string) => {
    const TxToast = (message: string) => <NotificationToast message={message} condition={condition} txHash={txHash} />
    switch (condition) {
      case 'Complete':
        if (txHash) {
          if (toast.isActive(txHash)) {
            toast.update(txHash, {
              render: TxToast(txType),
              ...txSuccess,
            })
          } else {
            toast(TxToast(txType), {
              toastId: txHash,
              ...txSuccess,
            })
          }
        }
        break
      case 'Incomplete':
        if (txHash) {
          if (toast.isActive(txHash)) {
            toast.update(txHash, {
              render: TxToast(txType),
              ...txError,
            })
          } else {
            toast(TxToast(txType), {
              toastId: txHash,
              ...txError,
            })
          }
        }
        break
      case 'Pending':
        if (txHash) {
          toast(TxToast(txType), {
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
        toast(TxToast(txType), {
          ...txError,
        })
    }
  }

  const appToast = (message: string, icon: any) => <AppToast message={message} icon={icon} />

  // Removes toasts from display on chainId or account change
  useEffect(() => {
    toast.dismiss()
  }, [chainId, account])

  // Runs whenever the chainId changes
  useEffect(() => {
    if (!errors) return
    if (errors.includes(Error.UNSUPPORTED_NETWORK)) {
      toast(appToast(`Unsupported network, please switch to a supported network`, <StyledWarning size={30} />), {
        toastId: Error.UNSUPPORTED_NETWORK,
        ...appError,
      })
    } else {
      toast.dismiss(Error.UNSUPPORTED_NETWORK)
    }
    if (errors.includes(Error.NO_PROVIDER)) {
      toast(appToast(`No Ethereum browser extension detected`, <StyledWarning size={30} />), {
        toastId: Error.NO_PROVIDER,
        type: toast.TYPE.ERROR,
        ...appError,
      })
    } else {
      toast.dismiss(Error.NO_PROVIDER)
    }
    if (errors.includes(Error.NO_ACCESS)) {
      toast(appToast(`Please authorize this website to access your account`, <StyledWarning size={30} />), {
        toastId: Error.NO_ACCESS,
        ...appError,
      })
    } else {
      toast.dismiss(Error.NO_ACCESS)
    }
    if (errors.includes(Error.UNKNOWN)) {
      toast(appToast(`An unknown error occurred`, <StyledWarning size={30} />), {
        toastId: Error.UNKNOWN,
        ...appError,
      })
    } else {
      toast.dismiss(Error.UNKNOWN)
    }
  }, [errors])

  const value = useMemo<ToastSystem>(
    () => ({
      makeTxToast: makeTxToast,
    }),
    []
  )

  return (
    <ToastsContext.Provider value={value}>
      <StylizedToastContainer />
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
