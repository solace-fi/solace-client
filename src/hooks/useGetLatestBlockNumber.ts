import { useEffect, useState, useRef } from 'react'
import { useWallet } from '../context/WalletManager'

export const useGetLatestBlockNumber = (dataVersion: number): number => {
  const wallet = useWallet()
  const [latestBlock, setLatestBlock] = useState<number>(0)
  const gettingBlockNumber = useRef(false)

  useEffect(() => {
    try {
      const fetchLatestBlockNumber = async () => {
        if (!wallet.library) return
        gettingBlockNumber.current = true
        const latestBlockNumber = await wallet.library.getBlockNumber()
        setLatestBlock(latestBlockNumber)
        gettingBlockNumber.current = false
      }
      if (gettingBlockNumber.current) return
      fetchLatestBlockNumber()
    } catch (e) {
      console.log(e)
    }
  }, [dataVersion, wallet.chainId, wallet.library])

  return latestBlock
}
