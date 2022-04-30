import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { useProvider } from '../../context/ProviderManager'

export const useENS = () => {
  const { account } = useWeb3React()
  const { provider } = useProvider()
  const [name, setName] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!account) return
    const checkForENS = async () => {
      const network = await provider.getNetwork()
      if (!network.ensAddress) return
      const name = await provider.lookupAddress(account)
      if (!name) return
      const address = await provider.resolveName(name)
      if (!address) return
      if (address == account) setName(name)
    }
    checkForENS()
  }, [provider, account])

  return name
}
