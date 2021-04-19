import React, { useEffect, useState } from 'react'
import axios from 'axios'

export function useCoingecko(): any {
  const [coins, setCoins] = useState<any>([])

  useEffect(() => {
    axios
      .get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=2&page=1&sparkline=false'
      )
      .then((res) => {
        setCoins(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return coins
}
