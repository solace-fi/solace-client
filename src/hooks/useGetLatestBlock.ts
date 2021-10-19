import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletManager'

export const useGetLatestBlock = (): Block | undefined => {
  const { library } = useWallet()
  const [latestBlock, setLatestBlock] = useState<Block | undefined>(undefined)

  useEffect(() => {
    if (!library) return
    library.on('block', async (res: number) => {
      const block = await library.getBlock(res)
      setLatestBlock(block)
    })

    return () => {
      library.removeAllListeners()
    }
  }, [library])

  return latestBlock
}
