import { useCallback, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useState, useEffect, useRef } from 'react'
import { formatUnits } from '@ethersproject/units'
import { queryBalance } from '../../utils/contract'
import { networks, useNetwork } from '../../context/NetworkManager'
// import SafeServiceClient from '@gnosis.pm/safe-service-client'
import { useProvider } from '../../context/ProviderManager'
import { useBridge } from './useBridge'
import { withBackoffRetries } from '../../utils/time'
import { SOLACE_TOKEN, XSOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../constants/mappings/token'
import { UnderwritingPoolUSDBalances } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { NetworkConfig } from '../../constants/types'

export const useNativeTokenBalance = (): string => {
  const { provider } = useProvider()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [balance, setBalance] = useState<string>('0')
  const running = useRef(false)

  useEffect(() => {
    const getNativeTokenBalance = async () => {
      if (!account || running.current) return
      try {
        running.current = true
        const balance = await provider.getBalance(account)
        const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
        setBalance(formattedBalance)
        running.current = false
      } catch (err) {
        console.log('getNativeTokenbalance', err)
      }
    }
    getNativeTokenBalance()
  }, [activeNetwork, account, version])

  return balance
}

export const useScpBalance = (): string => {
  const { keyContracts } = useContracts()
  const { vault } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()
  const { account } = useWeb3React()
  const [scpBalance, setScpBalance] = useState<string>('0')
  const { version } = useCachedData()

  const getScpBalance = async () => {
    if (!vault || !account) return
    try {
      const balance = await queryBalance(vault, account)
      const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
      setScpBalance(formattedBalance)
    } catch (err) {
      console.log('getScpBalance', err)
    }
  }

  useEffect(() => {
    if (!vault || !account) return
    getScpBalance()
    vault.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getScpBalance()
      }
    })

    return () => {
      vault.removeAllListeners()
    }
  }, [account, vault, version])

  return scpBalance
}

export const useSolaceBalance = (): string => {
  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const { version } = useCachedData()
  const [solaceBalance, setSolaceBalance] = useState<string>('0')

  const getSolaceBalance = useCallback(async () => {
    if (!solace || !account) return
    try {
      const balance = await queryBalance(solace, account)
      const formattedBalance = formatUnits(balance, SOLACE_TOKEN.constants.decimals)
      setSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getSolaceBalance', err)
    }
  }, [account, solace])

  useEffect(() => {
    if (!solace || !account) return
    getSolaceBalance()
    solace.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getSolaceBalance()
      }
    })

    return () => {
      solace.removeAllListeners()
    }
  }, [account, solace, getSolaceBalance, version])

  return solaceBalance
}

export const useXSolaceBalance = (): string => {
  const { keyContracts } = useContracts()
  const { xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const { version } = useCachedData()
  const [xSolaceBalance, setXSolaceBalance] = useState<string>('0')

  const getXSolaceBalance = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const balance = await queryBalance(xSolace, account)
      const formattedBalance = formatUnits(balance, XSOLACE_TOKEN.constants.decimals)
      setXSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getXSolaceBalance', err)
    }
  }, [account, xSolace])

  useEffect(() => {
    if (!xSolace || !account) return
    getXSolaceBalance()
    xSolace.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getXSolaceBalance()
      }
    })

    return () => {
      xSolace.removeAllListeners()
    }
  }, [account, xSolace, getXSolaceBalance, version])

  return xSolaceBalance
}

export const useBridgeBalance = (): string => {
  const { bSolace, getUserBridgeBalance } = useBridge()
  const { account } = useWeb3React()
  const { version } = useCachedData()
  const [bridgeBalance, setBridgeBalance] = useState<string>('0')

  useEffect(() => {
    if (!bSolace || !account) return
    const getBalance = async () => {
      const balance = await getUserBridgeBalance()
      const formattedBalance = formatUnits(balance, 18)
      setBridgeBalance(formattedBalance)
      bSolace.on('Transfer', async (from, to) => {
        if (from == account || to == account) {
          const balance = await getUserBridgeBalance()
          const formattedBalance = formatUnits(balance, 18)
          setBridgeBalance(formattedBalance)
        }
      })
    }
    getBalance()

    return () => {
      bSolace.removeAllListeners()
    }
  }, [account, bSolace, getUserBridgeBalance, version])

  return bridgeBalance
}

export const useXSolaceV1Balance = (): { xSolaceV1Balance: string; v1StakedSolaceBalance: string } => {
  const { keyContracts } = useContracts()
  const { xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const { version } = useCachedData()
  const [xSolaceV1Balance, setXSolaceV1Balance] = useState<string>('0')
  const [v1StakedSolaceBalance, setV1StakedSolaceBalance] = useState<string>('0')

  const getXSolaceV1Balance = useCallback(async () => {
    if (!xSolaceV1 || !account) return
    try {
      const balance = await queryBalance(xSolaceV1, account)
      const stakedBalance = await withBackoffRetries(async () => xSolaceV1.xSolaceToSolace(balance))
      const formattedStakedBalance = formatUnits(stakedBalance, SOLACE_TOKEN.constants.decimals)
      const formattedBalance = formatUnits(balance, XSOLACE_V1_TOKEN.constants.decimals)
      setXSolaceV1Balance(formattedBalance)
      setV1StakedSolaceBalance(formattedStakedBalance)
    } catch (err) {
      console.log('getXSolaceV1Balance', err)
    }
  }, [account, xSolaceV1])

  useEffect(() => {
    if (!xSolaceV1 || !account) return
    getXSolaceV1Balance()
    xSolaceV1.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getXSolaceV1Balance()
      }
    })

    return () => {
      xSolaceV1.removeAllListeners()
    }
  }, [account, xSolaceV1, getXSolaceV1Balance, version])

  return { xSolaceV1Balance, v1StakedSolaceBalance }
}

export const useCrossChainUnderwritingPoolBalance = () => {
  const { latestBlock } = useProvider()
  const [underwritingPoolBalance, setUnderwritingPoolBalance] = useState<string>('-')

  useEffect(() => {
    const getBalance = async () => {
      const uwpUSDBals = new UnderwritingPoolUSDBalances()
      const countedNetworks = networks.filter((n) => !n.isTestnet)
      const rpcUrlMapping: { [key: number]: string } = countedNetworks.reduce(
        (urls: any, network: NetworkConfig) => ({
          ...urls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      )
      const usdBalData = await uwpUSDBals.getUSDBalances_All(rpcUrlMapping)
      const totalUsdcBalance = usdBalData.total
      setUnderwritingPoolBalance(totalUsdcBalance.toString())
    }
    getBalance()
  }, [latestBlock])

  return { underwritingPoolBalance }
}
