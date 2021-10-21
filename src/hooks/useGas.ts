import { useState, useEffect } from 'react'
import { fetchGasPrice } from '../utils/explorer'
import { GasFeeListState } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'
import { getGasValue } from '../utils/formatting'
import { useWallet } from '../context/WalletManager'

export const useFetchGasPrice = (): GasFeeListState => {
  const { activeNetwork, chainId } = useNetwork()
  const { latestBlock } = useCachedData()

  const [state, setState] = useState<GasFeeListState>({
    options: [],
    loading: true,
  })

  useEffect(() => {
    const fetchGasPrices = async () => {
      await fetchGasPrice(activeNetwork.explorer.apiUrl, chainId)
        .then((result) => {
          const options = [
            {
              key: 'low',
              name: 'Slow',
              value: result.safe != NaN ? result.safe : state.options[0].value,
            },
            {
              key: 'average',
              name: 'Standard',
              value: result.proposed != NaN ? result.proposed : state.options[1].value,
            },
            {
              key: 'fast',
              name: 'Fast',
              value: result.fast != NaN ? result.fast : state.options[2].value,
            },
          ]
          setState({
            loading: false,
            options,
            selected: options[1],
            suggestedBaseFee: result.suggestBaseFee,
          })
        })
        .catch(() => {
          setState({
            ...state,
            loading: false,
          })
        })
    }
    fetchGasPrices()
  }, [chainId, latestBlock])

  return state
}

export const useGasConfig = (gasValue: any): any => {
  const { activeWalletConnector } = useWallet()
  const { activeNetwork } = useNetwork()
  const [gasConfig, setGasConfig] = useState<any>({})

  useEffect(() => {
    const getGasConfig = () => {
      // null check and testnet check
      if (!activeWalletConnector || !gasValue || activeNetwork.isTestnet) {
        setGasConfig({})
        return
      }

      // type 2 transaction
      if (activeWalletConnector.supportedTxTypes.includes(2) && activeNetwork.supportedTxTypes.includes(2))
        setGasConfig({
          maxFeePerGas: getGasValue(gasValue),
          type: 2,
        })

      // type 1 transaction
      setGasConfig({
        gasPrice: getGasValue(gasValue),
      })
    }
    getGasConfig()
  }, [activeWalletConnector, activeNetwork, gasValue])

  return { gasConfig }
}
