/*************************************************************************************

    Table of Contents:

    import react
    import manager
    import components

    LayoutContentWithLoader function
      custom hooks
      useState hooks
      useEffect hooks
      Render

  *************************************************************************************/
/* import react */
import React, { Fragment, useEffect, useState } from 'react'
import { HeroContainer } from '.'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Loader } from '../Loader/Loader'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  /* custom hooks */
  const { initialized } = useWallet()

  /* useState hooks */
  const [loader, setLoader] = useState<boolean>(false)

  /* useEffecthooks */
  useEffect(() => {
    setLoader(initialized)
  }, [initialized])
  return (
    <Fragment>
      {loader ? (
        children
      ) : (
        <HeroContainer>
          <Loader />
        </HeroContainer>
      )}
    </Fragment>
  )
}
