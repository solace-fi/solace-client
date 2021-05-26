import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { getEtherscanTxUrl } from '../utils/etherscan'
import { toast, ToastContainer } from 'react-toastify'
import { useWallet } from '../context/WalletManager'

import 'animate.css/animate.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { CHAIN_ID } from '../constants'
import { getNetworkName } from '../utils'

export enum Condition {
  SUCCESS = 'Complete',
  FAILURE = 'Incomplete',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum ERROR {
  NETWORK = 'network',
}

export type ToastSystem = {
  errors: any[]
  makeToast: (txType: string, condition: Condition, txHash?: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  errors: [undefined],
  makeToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const wallet = useWallet()
  const [errors, setErrors] = useState<ERROR[]>([])

  const makeToast = (txType: string, condition: Condition, txHash?: string) => {
    const Toast = (txType: any, cond: any) => (
      <div>
        <div>
          {txType}: Transaction {cond}
        </div>
        {txHash ? (
          <a
            href={getEtherscanTxUrl(wallet.chainId ?? Number(CHAIN_ID), txHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Etherscan
          </a>
        ) : null}
      </div>
    )
    switch (condition) {
      case 'Complete':
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
      case 'Incomplete':
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
      case 'Pending':
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

  useEffect(() => {
    const makeAppToast = () => {
      if (wallet.chainId !== Number(CHAIN_ID) && wallet.chainId !== undefined) {
        toast(`Wrong network, please switch to ${getNetworkName(Number(CHAIN_ID))}`, {
          toastId: ERROR.NETWORK,
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
        })
        setErrors([...errors, ERROR.NETWORK])
      } else {
        toast.dismiss(ERROR.NETWORK)
        setErrors((errors) => errors.filter((error) => error !== ERROR.NETWORK))
      }
    }
    makeAppToast()
  }, [wallet.chainId])

  const value = useMemo<ToastSystem>(
    () => ({
      errors,
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
