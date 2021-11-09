import { useState, useEffect, useCallback } from 'react'
import { fetchGasPrice } from '../utils/explorer'
import { GasConfiguration, GasFeeListState } from '../constants/types'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'
import { getGasValue } from '../utils/formatting'
import { useWallet } from '../context/WalletManager'
import { FunctionName } from '../constants/enums'
import { GAS_LIMIT } from '../constants'

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

export const useGetFunctionGas = () => {
  const { activeNetwork } = useNetwork()
  const { activeWalletConnector } = useWallet()
  const { gasPrices } = useCachedData()

  const getGasConfig = useCallback(
    (_gasValue: number | undefined): GasConfiguration => {
      // null check and testnet check
      const gasValue = _gasValue ?? gasPrices.selected?.value

      if (!activeWalletConnector || activeNetwork.isTestnet || !gasValue) {
        return {}
      }

      // type 2 transaction
      if (activeWalletConnector.supportedTxTypes.includes(2) && activeNetwork.supportedTxTypes.includes(2))
        return {
          maxFeePerGas: getGasValue(gasValue),
          type: 2,
        }

      // legacy type 0 transaction
      return {
        gasPrice: getGasValue(gasValue),
      }
    },
    [activeNetwork, activeWalletConnector, gasPrices]
  )

  const getAutoGasConfig = useCallback((): GasConfiguration => getGasConfig(undefined), [getGasConfig])

  const getGasLimit = useCallback(
    (productName: string, txType: FunctionName): number => {
      let callingGasLimit = GAS_LIMIT
      const supportedProduct = activeNetwork.cache.supportedProducts.find((p) => p.name == productName)
      if (supportedProduct) {
        const gasLimits = supportedProduct.gasLimits
        if (gasLimits && gasLimits[activeNetwork.chainId] && gasLimits[activeNetwork.chainId][txType])
          callingGasLimit = gasLimits[activeNetwork.chainId][txType]
      }
      return callingGasLimit
    },
    [activeNetwork]
  )

  return { getGasConfig, getAutoGasConfig, getGasLimit }
}
