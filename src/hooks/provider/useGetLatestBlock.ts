import { useEffect, useRef, useState } from 'react'
import { Block } from '@ethersproject/abstract-provider'

export const useGetLatestBlock = (library?: any): Block | undefined => {
  const [latestBlock, setLatestBlock] = useState<Block | undefined>(undefined)
  const running = useRef(false)

  useEffect(() => {
    if (!library) return
    library.on('block', async (res: number) => {
      if (running.current) return
      running.current = true
      const block = await library.getBlock(res)
      setLatestBlock(block)
      running.current = false
    })

    return () => {
      library.removeAllListeners()
    }
  }, [library])

  return latestBlock
}
