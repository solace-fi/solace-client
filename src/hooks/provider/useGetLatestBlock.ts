import { useEffect, useRef, useState } from 'react'
import { BlockData } from '../../constants/types'

export const useGetLatestBlock = (library?: any): BlockData => {
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  const [blockTimestamp, setBlockTimestamp] = useState<number | undefined>(undefined)
  const running = useRef(false)

  useEffect(() => {
    if (!library) return
    library.on('block', async (res: number) => {
      if (running.current) return
      running.current = true
      setBlockNumber(res)
      setBlockTimestamp(Date.now() / 1000)
      running.current = false
    })

    return () => {
      library.removeAllListeners()
    }
  }, [library])

  return { blockNumber, blockTimestamp }
}
