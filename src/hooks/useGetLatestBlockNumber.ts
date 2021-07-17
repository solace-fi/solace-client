import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletManager'

export const useGetLatestBlockNumber = (): number => {
  const wallet = useWallet()
  const [latestBlock, setLatestBlock] = useState<number>(0)

  useEffect(() => {
    try {
      const fetchLatestBlockNumber = async () => {
        if (!wallet.library) return
        const latestBlockNumber = await wallet.library.getBlockNumber()
        setLatestBlock(latestBlockNumber)
      }
      fetchLatestBlockNumber()
    } catch (e) {
      console.log(e)
    }
  }, [wallet.dataVersion, wallet.chainId])

  return latestBlock
}
