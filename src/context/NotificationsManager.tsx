import React, { createContext, useContext, useMemo } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'animate.css/animate.min.css'
import { getEtherscanTxUrl } from '../utils/etherscan'

export enum Condition {
  SUCCESS = 0,
  FAILURE = 1,
  PENDING = 2,
  CANCELLED = 3,
}

export type ToastSystem = {
  makeToast: (txType: string, condition: Condition, txHash?: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  makeToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const makeToast = (txType: string, condition: Condition, txHash?: string) => {
    const Toast = (txType: any, cond: any) => (
      <div>
        <div>
          {txType}: Transaction {cond}
        </div>
        {txHash ? (
          <a href={getEtherscanTxUrl(txHash)} target="_blank" rel="noopener noreferrer">
            Etherscan
          </a>
        ) : null}
      </div>
    )
    switch (condition) {
      case 0:
        if (txHash) {
          toast.update(txHash, {
            render: Toast(txType, 'successful'),
            type: toast.TYPE.SUCCESS,
            position: toast.POSITION.BOTTOM_LEFT,
            closeOnClick: false,
            closeButton: true,
          })
        }
        break
      case 1:
        if (txHash) {
          toast.update(txHash, {
            render: Toast(txType, 'failed'),
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            closeOnClick: false,
            closeButton: true,
          })
        }
        break
      case 2:
        if (txHash) {
          toast(Toast(txType, 'pending'), {
            toastId: txHash,
            type: toast.TYPE.INFO,
            autoClose: false,
            position: toast.POSITION.BOTTOM_LEFT,
            closeOnClick: false,
            closeButton: false,
          })
        }
        break
      default:
        toast(Toast(txType, 'cancelled'), {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 10000,
          closeOnClick: false,
          closeButton: true,
        })
    }
  }

  const value = useMemo<ToastSystem>(
    () => ({
      makeToast: makeToast,
    }),
    []
  )

  return (
    <ToastsContext.Provider value={value}>
      <ToastContainer />
      {props.children}
    </ToastsContext.Provider>
  )
}

export function useToasts(): ToastSystem {
  return useContext(ToastsContext)
}

const NotificationsManager: React.FC = (props) => {
  return <ToastsProvider>{props.children}</ToastsProvider>
}

export default NotificationsManager
