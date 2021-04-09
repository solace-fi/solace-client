import React from 'react'
import styled from 'styled-components'

export type CoinProps = {
  name: string
  price: string
  symbol: string
  marketcap: number
  volume: number
  image: string
  priceChange: number
}

const CoinContainer = styled.div`
  display: flex;
  justify-content: center;
`

const CoinRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid #d7d7d7;
  width: 900px;
`

const CoinObj = styled.div`
  display: flex;
  align-items: center;
  padding-right: 24px;
  min-width: 300px;
  h1 {
    font-size: 16px;
    width: 150px;
  }
  img {
    height: 30px;
    width: 30px;
    margin-right: 10px;
  }
`

const CoinSymbol = styled.div`
  text-transform: uppercase;
`

const CoinData = styled.div`
  display: flex;
  text-align: right;
  justify-content: space-between;
  width: 100%;
`

const CoinPrice = styled.div`
  width: 110px;
`

const CoinVolume = styled.div`
  width: 155px;
`

const CoinMarketCap = styled.div`
  width: 230px;
`

const CoinPercent = styled.div<{ change: number }>`
  width: 100px;
  color: ${({ change }) => (change < 0 ? '#f00606' : '#11d811')};
`

const Coin: React.FC<CoinProps> = ({ name, price, symbol, marketcap, volume, image, priceChange }) => {
  return (
    <CoinContainer>
      <CoinRow>
        <CoinObj>
          <img src={image} alt="crypto" />
          <h1>{name}</h1>
          <CoinSymbol>{symbol}</CoinSymbol>
        </CoinObj>
        <CoinData>
          <CoinPrice>${price}</CoinPrice>
          <CoinVolume>${volume.toLocaleString()}</CoinVolume>
          <CoinPercent change={priceChange}>{priceChange.toFixed(2)}%</CoinPercent>
          <CoinMarketCap>Mkt Cap: ${marketcap.toLocaleString()}</CoinMarketCap>
        </CoinData>
      </CoinRow>
    </CoinContainer>
  )
}

export default Coin
