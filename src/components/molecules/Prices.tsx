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
import { END_BREAKPOINT_5 } from '../../constants'
import { Unit } from '../../constants/enums'

/* import components */
import { SmallBox } from '../atoms/Box'
import { Text } from '../atoms/Typography'

/* import hooks */
import { usePairPrice } from '../../hooks/usePair'

/*************************************************************************************

styled components

*************************************************************************************/

const Price = styled.div`
  display: flex;
  align-content: center;
  flex-grow: 1;

  @media screen and (max-width: ${END_BREAKPOINT_5}px) {
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
  const pairPrice = usePairPrice()
  const nativeToken = activeNetwork.nativeCurrency.symbol
  const coinPrice = useCoingeckoPrice(unitToNameMap[nativeToken], 'usd')

  /*************************************************************************************

  Render

  *************************************************************************************/
  return (
    <Price>
      <SmallBox pl={10} info>
        <Text t4 bold autoAlign nowrap>
          SOLACE
        </Text>
        <SmallBox ml={10} info>
          <Text t4 bold autoAlign success>
            {`$${pairPrice}`}
          </Text>
        </SmallBox>
      </SmallBox>
      <SmallBox pl={10} info>
        <Text t4 bold autoAlign nowrap>
          {nativeToken}
        </Text>
        <SmallBox ml={10} info>
          <Text t4 bold autoAlign success>
            ${coinPrice ? coinPrice : '-'}
          </Text>
        </SmallBox>
      </SmallBox>
    </Price>
  )
}
