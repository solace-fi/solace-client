/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import context
    import constants
    import components
    import hooks

    styled components

    Prices function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import styled from 'styled-components'
import { useCoingeckoPrice } from '@usedapp/coingecko'

/* import context */
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH } from '../../constants'
import { Unit } from '../../constants/enums'

/* import components */
import { SmallBox } from '../atoms/Box'
import { Heading3 } from '../atoms/Typography'

/* import hooks */
import { usePairPrice } from '../../hooks/usePair'

/*************************************************************************************

styled components

*************************************************************************************/

const Price = styled.div`
  display: flex;
  align-content: center;
  flex-grow: 1;

  @media screen and (max-width: ${MAX_TABLET_SCREEN_WIDTH}px) {
    justify-content: space-evenly;
  }
`

const unitToNameMap: any = {
  [Unit.ETH]: 'ethereum',
  [Unit.MATIC]: 'matic-network',
}

export const Prices: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
  // const pairPrice = usePairPrice()
  const nativeToken = activeNetwork.nativeCurrency.symbol
  const coinPrice = useCoingeckoPrice(unitToNameMap[nativeToken], 'usd')

  /*************************************************************************************

  Render

  *************************************************************************************/
  return (
    <Price>
      {/* <SmallBox pl={10} navy>
        <Heading3 autoAlign nowrap>
          SOLACE
        </Heading3>
        <SmallBox ml={10} navy>
          <Heading3 autoAlign green>
            {`$${pairPrice}`}
          </Heading3>
        </SmallBox>
      </SmallBox> */}
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
    </Price>
  )
}
