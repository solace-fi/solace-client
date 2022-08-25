import { useCallback, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useState, useEffect, useRef } from 'react'
import { formatUnits } from '@ethersproject/units'
import { queryBalance } from '../../utils/contract'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract } from 'ethers'
import { ERC20_ABI } from '../../constants/abi'

export const useNativeTokenBalance = (): string => {
  const { provider } = useProvider()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { positiveVersion } = useCachedData()
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
  }, [activeNetwork, account, positiveVersion])

  return balance
}

export const useSolaceBalance = (): string => {
  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const { positiveVersion } = useCachedData()
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
  }, [account, solace, getSolaceBalance, positiveVersion])

  return solaceBalance
}

export const useBatchBalances = (
  coinOptions: {
    address: string
    name: string
    symbol: string
    decimals: number
  }[]
): {
  batchBalances: { addr: string; balance: BigNumber }[]
  loading: boolean
} => {
  const { account } = useWeb3React()
  const { provider } = useProvider()
  const { positiveVersion } = useCachedData()
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(false)
  const [batchBalances, setBatchBalances] = useState<{ addr: string; balance: BigNumber }[]>([])

  useEffect(() => {
    const getBalances = async () => {
      if (!activeNetwork.config.generalFeatures.native || !account || loading) return
      setLoading(true)
      const batchBalances = await Promise.all(
        coinOptions.map((o) => queryBalance(new Contract(o.address, ERC20_ABI, provider), account))
      )
      setBatchBalances(
        coinOptions.map((o, i) => {
          return { addr: o.address, balance: batchBalances[i] }
        })
      )
      setLoading(false)
    }
    getBalances()
  }, [account, coinOptions, provider, positiveVersion])

  return { loading, batchBalances }
}
