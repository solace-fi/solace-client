import React, { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletManager'
import { fetchEtherscanLatestBlockNumber } from '../utils/etherscan'
import { DEFAULT_CHAIN_ID } from '../constants'

export const useGetLatestBlockNumber = (): number => {
  const wallet = useWallet()
  const [latestBlock, setLatestBlock] = useState<number>(0)

  useEffect(() => {
    try {
      const fetchLatestBlockNumber = async () => {
        const { latestBlockNumber } = await fetchEtherscanLatestBlockNumber(wallet.chainId ?? Number(DEFAULT_CHAIN_ID))
        setLatestBlock(latestBlockNumber)
      }
      fetchLatestBlockNumber()
    } catch (e) {
      console.log(e)
    }
  }, [wallet.dataVersion, wallet.chainId])

  return latestBlock
}
