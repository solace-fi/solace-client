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
import { useLocation } from 'react-router'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Loader } from '../atoms/Loader'
import { Flex, HeroContainer, SideNavContent } from '../atoms/Layout'
import { MAX_WIDTH } from '../../constants'

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  /* hooks */
  const { initialized } = useWallet()
  const location = useLocation()
  const [loader, setLoader] = useState<boolean>(false)
  useEffect(() => {
    setLoader(initialized)
  }, [initialized])

  return (
    <Flex>
      <div style={{ width: '100%' }}>
        {loader || location.pathname == '/' ? (
          children
        ) : (
          <HeroContainer>
            <Loader />
          </HeroContainer>
        )}
      </div>
      <SideNavContent desktopWidth={8}></SideNavContent>
    </Flex>
  )
}
