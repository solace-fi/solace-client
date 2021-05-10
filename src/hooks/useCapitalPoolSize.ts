import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/Web3Manager'
import { formatEther } from '@ethersproject/units'

export const useCapitalPoolSize = () => {
  const { vault, registry } = useContracts()
  const wallet = useWallet()
  const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!registry || !vault) return
      try {
        const addr = await registry.governance()
        console.log('GOVERNANCE ', addr)
        const ans = await vault.totalAssets()
        // console.log('capital pool size', formatEther(ans))
        setCapitalPoolSize(ans)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, registry, wallet])

  return capitalPoolSize
}
