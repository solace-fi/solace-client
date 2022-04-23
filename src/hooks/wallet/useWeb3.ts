import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { WalletConnectors } from '../../context/WalletManager'
import { WalletConnector } from '../../wallet'
import { MetaMaskConnector, MetamaskConnector } from '../../wallet/wallet-connectors/MetaMask'
import { useWindowDimensions } from '../internal/useWindowDimensions'

// try to eager connect on boot if the user has a selectedProvider or a browser wallet available already
export const useEagerConnect = (selectedProvider?: string): { tried: boolean; activeConnector?: WalletConnector } => {
  const { activate, active, connector } = useWeb3React()
  const { isMobile } = useWindowDimensions()

  const [triedLocallyStored, setTriedLocallyStored] = useState(false)
  const [tried, setTried] = useState(false)

  const [activeConnector, setActiveConnector] = useState<WalletConnector | undefined>(undefined)

  // if connector has been changed and becomes undefined, set active connector to undefined
  useEffect(() => {
    if (!connector) {
      setActiveConnector(undefined)
    }
  }, [connector])

  // If there is a locally stored selectedProvider and it is not an injected, we'll try to connect to that first.
  useEffect(() => {
    if (selectedProvider) {
      const walletConnector = WalletConnectors.find((c) => c.id === selectedProvider)
      if (walletConnector && !(walletConnector.getConnector() instanceof MetamaskConnector)) {
        activate(walletConnector.getConnector())
          .then(() => setActiveConnector(walletConnector))
          .catch(() => setTriedLocallyStored(true))
      }
    } else {
      setTriedLocallyStored(true)
    }
  }, [activate, selectedProvider])

  // Try injected connector if the web3 is still not active & already tried using locally stored provider
  useEffect(() => {
    if (!active && triedLocallyStored) {
      const injected = MetaMaskConnector.getConnector()
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(injected)
            .then(() => setActiveConnector(MetaMaskConnector))
            .catch(() => setTried(true))
        } else {
          if (isMobile && (window as any).ethereum) {
            activate(injected, undefined, true)
              .then(() => setActiveConnector(MetaMaskConnector))
              .catch(() => {
                setTried(true)
              })
          } else {
            setTried(true)
          }
        }
      })
    }
  }, [activate, active, isMobile, triedLocallyStored])

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  // tried is a flag for allowing inactiveListener to be called, isInjected indicates if connector is an injected, not an injected, or undefined
  return { tried, activeConnector }
}

// in case eager connect did not connect the user's wallet, react to logins on a potential injected provider
export const useInactiveListener = (suppress = false): void => {
  const { active, error, activate } = useWeb3React()
  useEffect(() => {
    const ethereum = (window as any).ethereum

    // if web3 is inactive
    if (!suppress && !active && !error && ethereum && ethereum.on) {
      const injected = MetaMaskConnector.getConnector()

      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }

      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId)
        activate(injected).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        if (accounts.length > 0) {
          activate(injected).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    } else {
    }

    return undefined
  }, [active, error, suppress, activate])
}
