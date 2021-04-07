import { useEffect, useState } from 'react'
import { WalletConnector } from '../wallets'
import { useWeb3React } from '@web3-react/core'

import { injected } from '../connectors'

export function useEagerConnect(
  callback: (walletConnector: WalletConnector) => Promise<void>,
  arg: WalletConnector
): boolean {
  const { active } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        callback(arg).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, []) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}
