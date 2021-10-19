/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components

    LayoutContentWithLoader
      hooks

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
  /* hooks */
  const { initialized } = useWallet()
  const location = useLocation()
  const [loader, setLoader] = useState<boolean>(false)
  useEffect(() => {
    setLoader(initialized)
  }, [initialized])

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
