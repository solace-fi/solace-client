import React, { Fragment, useEffect, useState } from 'react'
import { useWallet } from '../../context/Web3Manager'
import { Loader } from '../Loader'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  const { initialized } = useWallet()
  const [loader, setLoader] = useState<boolean>(false)

  useEffect(() => {
    setLoader(initialized)
  }, [initialized])
  return <Fragment>{loader ? children : <Loader />}</Fragment>
}
