import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

export const useENS = () => {
  const { library, account } = useWeb3React()
  const [name, setName] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!account || !library) return
    const checkForENS = async () => {
      const network = await library.getNetwork()
      if (!network.ensAddress) return
      const name = await library.lookupAddress(account)
      if (!name) return
      const address = await library.resolveName(name)
      if (!address) return
      if (address == account) setName(name)
    }
    checkForENS()
  }, [library, account])

  return name
}
