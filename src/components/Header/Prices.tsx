/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import context
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
import { useCoingeckoPrice } from '@usedapp/coingecko'

/* import context */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { CP_ROI, LP_ROI, MAX_PRICES_SCREEN_WIDTH } from '../../constants/'
import { Unit } from '../../constants/enums'

/* import components */
import { Header } from './index'
import Account from '../User/Account'
import { SmallBox } from '../Box'
import { Heading3 } from '../Typography'
import { Footer } from '../Layout'

/* import hooks */
import { usePairPrice } from '../../hooks/usePair'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getNativeTokenUnit } from '../../utils/formatting'

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

const unitToNameMap: any = {
  [Unit.ETH]: 'ethereum',
  [Unit.MATIC]: 'matic-network',
}

export const Prices = () => {
  const { chainId } = useWallet()
  const pairPrice = usePairPrice()
  const nativeToken = getNativeTokenUnit(chainId)
  const coinPrice = useCoingeckoPrice(unitToNameMap[nativeToken], 'usd')

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
          {nativeToken}
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            ${coinPrice ? coinPrice : '-'}
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
