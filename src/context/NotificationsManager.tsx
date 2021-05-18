import React, { createContext, useContext, useMemo } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'animate.css/animate.min.css'

export type ToastSystem = {
  makeToast: (txType: string, id: string, condition: string) => void
}

const ToastsContext = createContext<ToastSystem>({
  makeToast: () => undefined,
})

const ToastsProvider: React.FC = (props) => {
  const makeToast = (txType: string, id: string, condition: string) => {
    const Toast = (txType: any, cond: any) => (
      <div>
        {/* <p> */}
        {txType}: Transaction {cond}
        {/* </p> */}
        {/* <p>Etherscan: {link}</p> */}
      </div>
    )
    switch (condition) {
      case 'success':
        toast.update(id, {
          render: Toast(txType, 'successful'),
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          closeOnClick: false,
          closeButton: true,
        })
        break
      case 'failure':
        if (toast.isActive(id)) {
          toast.update(id, {
            render: Toast(txType, 'failed'),
            type: toast.TYPE.ERROR,
            autoClose: 10000,
            position: toast.POSITION.BOTTOM_LEFT,
            closeOnClick: false,
          })
        } else {
          toast(Toast(txType, 'failed'), {
            toastId: id,
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            autoClose: 10000,
            closeOnClick: false,
          })
        }
        break
      default:
        toast(Toast(txType, 'pending'), {
          toastId: id,
          type: toast.TYPE.INFO,
          autoClose: false,
          position: toast.POSITION.BOTTOM_LEFT,
          closeOnClick: false,
          closeButton: false,
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
