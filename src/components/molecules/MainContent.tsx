/*************************************************************************************

    Table of Contents:

    import packages
    import components

    MainContent
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { Flex, SideNavContent } from '../atoms/Layout'

export const MainContent: React.FC = ({ children }) => {
  /* hooks */

  return (
    <Flex>
      <div style={{ width: '100%' }}>{children}</div>
      <SideNavContent desktopWidth={8}></SideNavContent>
    </Flex>
  )
}
