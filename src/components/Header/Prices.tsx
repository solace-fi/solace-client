/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import components
    import hooks
    import utils

    styled components

    Prices function
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import styled from 'styled-components'

/* import constants */
import { CP_ROI, LP_ROI, MAX_PRICES_SCREEN_WIDTH } from '../../constants/'

/* import components */
import { Header } from './index'
import Account from '../User/Account'
import { SmallBox } from '../Box'
import { Heading3 } from '../Text'

/* import hooks */
import { useCoingecko } from '../../hooks/useCoingecko'
import { usePairPrice } from '../../hooks/usePair'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { Footer } from '../Layout'

/*************************************************************************************

styled components

*************************************************************************************/

const Price = styled.div`
  display: flex;
  align-content: center;
  flex-grow: 1;

  @media screen and (max-width: ${MAX_PRICES_SCREEN_WIDTH}px) {
    justify-content: space-evenly;
  }
`

export const Prices = () => {
  const coins = useCoingecko()
  const pairPrice = usePairPrice()

  return (
    <Price>
      <SmallBox pl={10} navy>
        <Heading3 autoAlign nowrap>
          SOLACE
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            {pairPrice ? `$${pairPrice}` : '-'}
          </Heading3>
        </SmallBox>
      </SmallBox>
      <SmallBox pl={10} navy>
        <Heading3 autoAlign nowrap>
          ETH
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            ${coins[0] ? coins[0].current_price : '-'}
          </Heading3>
        </SmallBox>
      </SmallBox>
      <SmallBox pl={10} navy>
        <Heading3 autoAlign nowrap>
          LP ROI
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            {LP_ROI}
          </Heading3>
        </SmallBox>
      </SmallBox>
      <SmallBox pl={10} navy>
        <Heading3 autoAlign nowrap>
          CP ROI
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            {CP_ROI}
          </Heading3>
        </SmallBox>
      </SmallBox>
    </Price>
  )
}

export const PageHeader: React.FC = () => {
  const { width } = useWindowDimensions()

  return (
    <Header>
      {width > MAX_PRICES_SCREEN_WIDTH && <Prices />}
      <Account />
    </Header>
  )
}

export const BottomPrices: React.FC = () => {
  const { width } = useWindowDimensions()

  return width <= MAX_PRICES_SCREEN_WIDTH ? (
    <Footer>
      <Prices />
    </Footer>
  ) : null
}
