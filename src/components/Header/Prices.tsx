import React from 'react'
import styled from 'styled-components'

import { Header } from './index'
import Account from '../User/Account'
import { useCoingecko } from '../../hooks/useCoingecko'
import { fixed } from '../../utils/formatting'
import { usePairPrice } from '../../hooks/usePair'

import { CP_ROI, LP_ROI } from '../../constants/'

const Price = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  flex-grow: 1;
`

const PriceItem = styled.div`
  display: flex;
  align-items: baseline;
  padding-right: 32px;
  line-height: 1.8;
`

const PriceTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
`

const PriceValue = styled.span`
  margin-left: 6px;
  font-size: 12px;
  color: #00ffd1;
`

const PriceAddition = styled.span`
  margin-left: 8px;
  font-size: 10px;
`

export default function App(): any {
  const coins = useCoingecko()
  const pairPrice = usePairPrice()

  return (
    <Header>
      <Price>
        <PriceItem>
          <PriceTitle>SOLACE/USD</PriceTitle>
          <PriceValue>{pairPrice ? `$${pairPrice}` : '-'}</PriceValue>
          {/* <PriceAddition>+3.56%</PriceAddition> */}
        </PriceItem>
        <PriceItem>
          <PriceTitle>ETH/USD</PriceTitle>
          <PriceValue>${coins[0] ? coins[0].current_price : '-'}</PriceValue>
          <PriceAddition>{`${coins[0] ? fixed(coins[0].price_change_percentage_24h) : '-'}%`}</PriceAddition>
        </PriceItem>
        <PriceItem>
          <PriceTitle>SOLACE/ETH LP APY.</PriceTitle>
          <PriceValue>{LP_ROI}</PriceValue>
        </PriceItem>
        <PriceItem>
          <PriceTitle>ETH CP APY.</PriceTitle>
          <PriceValue>{CP_ROI}</PriceValue>
        </PriceItem>
      </Price>
      <Account />
    </Header>
  )
}
