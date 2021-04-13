import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

export const useBalance = (): number | null | undefined => {
  const context = useWeb3React()
  const { library, chainId, account } = context

  const [balance, setBalance] = useState<number | null | undefined>(0)

  useEffect(() => {
    console.log('BALANCE CHANGE', account, library)
    if (!!account && !!library) {
      let stale = false

      library
        .getBalance(account)
        .then((balance: number) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return balance
}
