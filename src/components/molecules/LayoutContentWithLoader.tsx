/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components

    LayoutContentWithLoader
      hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useEffect, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Loader } from '../atoms/Loader'
import { HeroContainer } from '../atoms/Layout'
import { useRouter } from 'next/router'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  /* hooks */
  const { initialized } = useWallet()
  const location = useRouter()
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
