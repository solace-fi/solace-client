import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { getEtherscanTxUrl } from '../utils/etherscan'
import { toast, ToastContainer } from 'react-toastify'
import { useWallet } from '../context/WalletManager'

import 'animate.css/animate.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { CHAIN_ID } from '../constants'
import { TransactionCondition, Error } from '../constants/enums'
import { getNetworkName } from '../utils'
import { HyperLink } from '../components/Hyperlink'
import { Button } from '../components/Button'

/*

This manager allows for notifications to be created. such notifications can be created
on trigger or manually. Errors are also tracked so appropriate notifications can be shown but 
they can also be used elsewhere in the app for other purposes, such as disabling a certain feature
if an error occurs.

*/

export type ToastSystem = {
  errors: any[]
  makeToast: (txType: string, condition: TransactionCondition, txHash?: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  errors: [undefined],
  makeToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const wallet = useWallet()
  const [errors, setErrors] = useState<Error[]>([])

  const makeToast = (txType: string, condition: TransactionCondition, txHash?: string) => {
    const Toast = (txType: any, cond: any) => (
      <div>
        <div>
          {txType}: Transaction {cond}
        </div>
        {txHash ? (
          <HyperLink
            href={getEtherscanTxUrl(wallet.chainId ?? Number(CHAIN_ID), txHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Check on Etherscan</Button>
          </HyperLink>
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

  // Runs whenever the chainId changes
  useEffect(() => {
    const makeAppToast = () => {
      if (wallet.chainId !== Number(CHAIN_ID) && wallet.chainId !== undefined) {
        toast(`Wrong network, please switch to ${getNetworkName(Number(CHAIN_ID))} on MetaMask`, {
          toastId: Error.NETWORK,
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
        })
        setErrors([...errors, Error.NETWORK])
      } else {
        toast.dismiss(Error.NETWORK)
        setErrors((errors) => errors.filter((error) => error !== Error.NETWORK))
      }
    }
    makeAppToast()
  }, [wallet.chainId])

  const value = useMemo<ToastSystem>(
    () => ({
      errors,
      makeToast: makeToast,
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
