import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'

export const useCapitalPoolSize = () => {
  const { vault, registry } = useContracts()
  const { version, dataVersion } = useWallet()
  const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!registry || !vault) return
      try {
        const ans = await vault.totalAssets()
        setCapitalPoolSize(ans)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, registry, version, dataVersion])

  return capitalPoolSize
}
