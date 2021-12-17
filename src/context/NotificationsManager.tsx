import React, { createContext, useContext, useMemo, useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { useWallet } from '../context/WalletManager'

import { TransactionCondition, Error, SystemNotice } from '../constants/enums'
import { StylizedToastContainer } from '../components/atoms/Message'
import { AppToast, NotificationToast } from '../components/molecules/Toast'
import { StyledInfo, StyledWarning } from '../components/atoms/Icon'
import { useGeneral } from './GeneralProvider'
import { ErrorData, SystemNoticeData } from '../constants/types'

/*
This manager allows for notifications to be created. such notifications can be created
on trigger or manually. Error are also tracked so appropriate notifications can be shown but 
they can also be used elsewhere in the app for other purposes, such as disabling a certain feature
if an error occurs.
*/

type ToastSystem = {
  makeTxToast: (txType: string, condition: TransactionCondition, txHash?: string) => void
  makeAppToast: (
    parsedData: SystemNoticeData | ErrorData,
    id: SystemNotice | Error,
    appToast: JSX.Element,
    toastConfig: any,
    isNotice: boolean
  ) => void
  toastSettings: {
    txSuccess: any
    txError: any
    appNotice: any
    appError: any
  }
}

const ToastsContext = createContext<ToastSystem>({
  makeTxToast: () => undefined,
  makeAppToast: () => undefined,
  toastSettings: {
    txSuccess: undefined,
    txError: undefined,
    appNotice: undefined,
    appError: undefined,
  },
})

const ToastsProvider: React.FC = (props) => {
  const { notices, errors } = useGeneral()
  const { account } = useWallet()
  const [noticeMap, setNoticeMap] = useState(new Map())
  const [errorMap, setErrorMap] = useState(new Map())
  const lastAccount = useRef<string>('')

  const txSuccess = {
    autoClose: 10000,
    type: toast.TYPE.SUCCESS,
    position: toast.POSITION.BOTTOM_RIGHT,
    closeOnClick: false,
    closeButton: true,
    className: 'success-toast',
  }

  const txError = {
    autoClose: 10000,
    type: toast.TYPE.ERROR,
    position: toast.POSITION.BOTTOM_RIGHT,
    closeOnClick: true,
    closeButton: true,
    className: 'error-toast',
  }

  const appNotice: any = {
    type: toast.TYPE.INFO,
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: false,
    closeOnClick: false,
    closeButton: true,
    className: 'info-toast',
  }

  const appError: any = {
    type: toast.TYPE.ERROR,
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: false,
    closeOnClick: true,
    closeButton: true,
    className: 'error-toast',
  }

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
            position: toast.POSITION.BOTTOM_RIGHT,
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

  const makeAppToast = (
    parsedData: SystemNoticeData | ErrorData,
    id: SystemNotice | Error,
    appToast: JSX.Element,
    toastConfig: any,
    isNotice: boolean
  ) => {
    if (isNotice) {
      if (noticeMap.get(parsedData.type) == parsedData.metadata.concat(parsedData.uniqueId)) return
      setNoticeMap(new Map(noticeMap.set(parsedData.type, parsedData.metadata.concat(parsedData.uniqueId))))
    } else {
      if (errorMap.get(parsedData.type) == parsedData.metadata.concat(parsedData.uniqueId)) return
      setErrorMap(new Map(errorMap.set(parsedData.type, parsedData.metadata.concat(parsedData.uniqueId))))
    }
    if (toast.isActive(id)) {
      toast.update(id, {
        render: appToast,
        ...toastConfig,
      })
    } else {
      toast(appToast, {
        toastId: id,
        ...toastConfig,
      })
    }
  }

  // Removes toasts from display on chainId or account change
  useEffect(() => {
    // if this is the first account, meaning the account went from undefined to valid, do
    // not dismiss toasts
    if (!account || !lastAccount.current) return
    console.log(lastAccount.current, account)
    lastAccount.current = account
    toast.dismiss()
  }, [account])

  useEffect(() => {
    if (!notices) return
    const lossEventDetectedNotice = notices.find(
      (notice) => (JSON.parse(notice) as SystemNoticeData).type == SystemNotice.LOSS_EVENT_DETECTED
    )
    if (lossEventDetectedNotice) {
      const parsedNotice: SystemNoticeData = JSON.parse(lossEventDetectedNotice)
      makeAppToast(
        parsedNotice,
        SystemNotice.LOSS_EVENT_DETECTED,
        appToast(`${parsedNotice.metadata}`, <StyledInfo size={30} />),
        appNotice,
        true
      )
    } else {
      setNoticeMap(new Map(noticeMap.set(SystemNotice.LOSS_EVENT_DETECTED, undefined)))
      toast.dismiss(SystemNotice.LOSS_EVENT_DETECTED)
    }
  }, [notices])

  useEffect(() => {
    if (!errors) return
    const unsupportedNetworkError = errors.find(
      (error) => (JSON.parse(error) as ErrorData).type == Error.UNSUPPORTED_NETWORK
    )
    if (unsupportedNetworkError) {
      const parsedError: ErrorData = JSON.parse(unsupportedNetworkError)
      makeAppToast(
        parsedError,
        Error.UNSUPPORTED_NETWORK,
        appToast(`Unsupported network, please switch to a supported network`, <StyledWarning size={30} />),
        appError,
        false
      )
    } else {
      setErrorMap(new Map(errorMap.set(Error.UNSUPPORTED_NETWORK, undefined)))
      toast.dismiss(Error.UNSUPPORTED_NETWORK)
    }

    const noProviderError = errors.find((error) => (JSON.parse(error) as ErrorData).type == Error.NO_PROVIDER)
    if (noProviderError) {
      const parsedError: ErrorData = JSON.parse(noProviderError)
      makeAppToast(
        parsedError,
        Error.NO_PROVIDER,
        appToast(`No Ethereum browser extension detected`, <StyledWarning size={30} />),
        appError,
        false
      )
    } else {
      setErrorMap(new Map(errorMap.set(Error.NO_PROVIDER, undefined)))
      toast.dismiss(Error.NO_PROVIDER)
    }

    const noAccessError = errors.find((error) => (JSON.parse(error) as ErrorData).type == Error.NO_ACCESS)
    if (noAccessError) {
      const parsedError: ErrorData = JSON.parse(noAccessError)
      makeAppToast(
        parsedError,
        Error.NO_ACCESS,
        appToast(`Please authorize this website to access your account`, <StyledWarning size={30} />),
        appError,
        false
      )
    } else {
      setErrorMap(new Map(errorMap.set(Error.NO_ACCESS, undefined)))
      toast.dismiss(Error.NO_ACCESS)
    }

    const walletNetworkUnsyncError = errors.find(
      (error) => (JSON.parse(error) as ErrorData).type == Error.WALLET_NETWORK_UNSYNC
    )
    if (walletNetworkUnsyncError) {
      const parsedError: ErrorData = JSON.parse(walletNetworkUnsyncError)
      makeAppToast(
        parsedError,
        Error.WALLET_NETWORK_UNSYNC,
        appToast(
          `Please ensure that the network on your wallet and the network on the Solace app match`,
          <StyledWarning size={30} />
        ),
        appError,
        false
      )
    } else {
      setErrorMap(new Map(errorMap.set(Error.WALLET_NETWORK_UNSYNC, undefined)))
      toast.dismiss(Error.WALLET_NETWORK_UNSYNC)
    }

    const unknownError = errors.find((error) => (JSON.parse(error) as ErrorData).type == Error.UNKNOWN_WALLET_ERROR)
    if (unknownError) {
      const parsedError: ErrorData = JSON.parse(unknownError)
      makeAppToast(
        parsedError,
        Error.UNKNOWN_WALLET_ERROR,
        appToast(`An unknown error occurred: ${parsedError.metadata}`, <StyledWarning size={30} />),
        appError,
        false
      )
    } else {
      setErrorMap(new Map(errorMap.set(Error.UNKNOWN_WALLET_ERROR, undefined)))
      toast.dismiss(Error.UNKNOWN_WALLET_ERROR)
    }
  }, [errors])

  const value = useMemo<ToastSystem>(
    () => ({
      makeTxToast,
      makeAppToast,
      toastSettings: {
        txSuccess,
        txError,
        appNotice,
        appError,
      },
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
export function useNotifications(): ToastSystem {
  return useContext(ToastsContext)
}

const NotificationsManager: React.FC = (props) => {
  return <ToastsProvider>{props.children}</ToastsProvider>
}

export default NotificationsManager
