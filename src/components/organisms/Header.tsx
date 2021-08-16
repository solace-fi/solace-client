/*************************************************************************************

    Table of Contents:

    import react
    import components
    import constants
    import hooks

    PageHeader function
      custom hooks
      Render

    BottomPrices function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import components */
import { Footer } from '../atoms/Layout'
import { CenteredHeader, FlexEndHeader } from '../atoms/Header'
import { Account, UserAccount } from './Account'
import { Prices } from '../molecules/Prices'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

export const PageHeader: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  /*************************************************************************************

      Render

  *************************************************************************************/
  return (
    <>
      {width > MAX_MOBILE_SCREEN_WIDTH && (
        <FlexEndHeader>
          {width > MAX_TABLET_SCREEN_WIDTH && <Prices />}
          <Account />
        </FlexEndHeader>
      )}
    </>
  )
}

export const BottomPrices: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  /*************************************************************************************
    
          Render
    
  *************************************************************************************/
  return (
    <>
      {MAX_MOBILE_SCREEN_WIDTH <= width && width < MAX_TABLET_SCREEN_WIDTH && (
        <Footer>
          <Prices />
        </Footer>
      )}
      {width < MAX_MOBILE_SCREEN_WIDTH && (
        <Footer>
          <CenteredHeader>
            <UserAccount />
          </CenteredHeader>
        </Footer>
      )}
    </>
  )
}
