import React, { Fragment, useEffect, useState } from 'react'
<<<<<<< HEAD
import { useWallet } from '../../context/WalletManager'
=======
import { useWallet } from '../../context/Web3Manager'
>>>>>>> c7e8d054ad0ffd5c033b7688cec6888a10a2f5a6
import { Loader } from '../Loader'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  const { initialized } = useWallet()
  const [loader, setLoader] = useState<boolean>(false)

  useEffect(() => {
    setLoader(initialized)
  }, [initialized])
  return <Fragment>{loader ? children : <Loader />}</Fragment>
}
