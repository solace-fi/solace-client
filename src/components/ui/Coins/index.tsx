import React from 'react'
import { useCoingecko } from '../../../hooks/useCoingecko'
import Coin from '../../../components/ui/Coin'

function Coins(): any {
  const coins = useCoingecko()

  return (
    <>
      {coins.map((coin: any) => (
        <Coin
          key={coin.id}
          name={coin.name}
          price={coin.current_price}
          symbol={coin.symbol}
          marketcap={coin.total_volume}
          volume={coin.market_cap}
          image={coin.image}
          priceChange={coin.price_change_percentage_24h}
        />
      ))}
    </>
  )
}

export default Coins
