import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useWallet } from '../context/WalletManager'

export function useCoingecko(): any {
  const { dataVersion } = useWallet()
  const [coins, setCoins] = useState<any>([])

  useEffect(() => {
    axios
      .get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=1&page=1&sparkline=false'
      )
      .then((res) => {
        setCoins(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [dataVersion])

  return coins
}
