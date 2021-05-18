import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
<<<<<<< HEAD
import { useWallet } from '../context/WalletManager'
=======
import { useWallet } from '../context/Web3Manager'
>>>>>>> c7e8d054ad0ffd5c033b7688cec6888a10a2f5a6

export const useCapitalPoolSize = () => {
  const { vault, registry } = useContracts()
  const wallet = useWallet()
  const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!registry || !vault) return
      try {
        // const addr = await registry.governance()
        // console.log('GOVERNANCE ', addr, wallet)
        const ans = await vault.totalAssets()
        setCapitalPoolSize(ans)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, registry, wallet])

  return capitalPoolSize
}
