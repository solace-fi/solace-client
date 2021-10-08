/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components

    LayoutContentWithLoader function
      custom hooks
      useState hooks
      useEffect hooks
      Render

  *************************************************************************************/
/* import react */
import React, { Fragment, useEffect, useState } from 'react'

/* import packages */
import { useLocation } from 'react-router'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Loader } from '../atoms/Loader'
import { HeroContainer } from '../atoms/Layout'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  /* custom hooks */
  const { initialized } = useWallet()
  const location = useLocation()

  /* useState hooks */
  const [loader, setLoader] = useState<boolean>(false)

  /* useEffecthooks */
  useEffect(() => {
    setLoader(initialized)
  }, [initialized])

  /* render */
  return (
    <Fragment>
      {loader || location.pathname == '/' ? (
        children
      ) : (
        <HeroContainer>
          <Loader />
        </HeroContainer>
      )}
    </Fragment>
  )
}
