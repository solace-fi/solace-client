import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'

export const useCapitalPoolSize = (): string => {
  const { vault, registry } = useContracts()
  const { version, dataVersion } = useWallet()
  const [capitalPoolSize, setCapitalPoolSize] = useState<string>('0.00')

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!registry || !vault) return
      try {
        const size = await vault.totalAssets()
        const formattedSize = formatEther(size)
        setCapitalPoolSize(formattedSize)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, registry, version, dataVersion])

  return capitalPoolSize
}
