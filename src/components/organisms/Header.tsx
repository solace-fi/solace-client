/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import components
    import constants
    import hooks

    PageHeader function
      custom hooks
      Render

    Footer function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import { useLocation } from 'react-router'

/* import components */
import { FooterComponent } from '../atoms/Layout'
import { CenteredHeader, FlexEndHeader } from '../atoms/Header'
import { UserAccount } from './Account'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH, MAX_NAVBAR_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

export const PageHeader: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const location = useLocation()

  /*************************************************************************************

      Render

  *************************************************************************************/
  return (
    <>
      {width > MAX_MOBILE_SCREEN_WIDTH && width <= MAX_NAVBAR_SCREEN_WIDTH && (
        <FlexEndHeader>{<UserAccount light={location.pathname == '/'} />}</FlexEndHeader>
      )}
    </>
  )
}

export const Footer: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  /*************************************************************************************
    
          Render
    
  *************************************************************************************/
  return (
    <>
      {width < MAX_MOBILE_SCREEN_WIDTH && (
        <FooterComponent>
          <CenteredHeader>
            <UserAccount light />
          </CenteredHeader>
        </FooterComponent>
      )}
    </>
  )
}
