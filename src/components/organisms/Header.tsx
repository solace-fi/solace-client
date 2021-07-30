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
import { Header } from '../atoms/Header'
import { Account } from './Account'
import { Prices } from '../molecules/Prices'

/* import constants */
import { MAX_PRICES_SCREEN_WIDTH } from '../../constants'

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
    <Header>
      {width > MAX_PRICES_SCREEN_WIDTH && <Prices />}
      <Account />
    </Header>
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
  return width <= MAX_PRICES_SCREEN_WIDTH ? (
    <Footer>
      <Prices />
    </Footer>
  ) : null
}
