import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { GasConfiguration, GasData } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { getGasValue } from '../../utils/formatting'
import { useWallet } from '../../context/WalletManager'
import { FunctionName } from '../../constants/enums'
import { GAS_LIMIT, ZERO } from '../../constants'
import { useProvider } from '../../context/ProviderManager'
import { formatUnits } from 'ethers/lib/utils'
import { FeeData } from '@ethersproject/providers'

export const useFetchGasData = (): GasData | undefined => {
  const { activeNetwork, chainId } = useNetwork()
  const { latestBlock } = useProvider()
  const { library } = useWallet()
  const running = useRef(false)
  // const running = useRef(false)
  const [gasData, setGasData] = useState<GasData | undefined>(undefined)

  useEffect(() => {
    const fetchGasData = async () => {
      running.current = true
      await library.getFeeData().then((result: FeeData) => {
        const gasPriceStr = formatUnits(result.gasPrice ?? ZERO, 'gwei')
        const gasPrice = activeNetwork.config.specialFeatures.hardcodedGasPrice ?? Math.ceil(parseFloat(gasPriceStr))

        const maxFeePerGasStr = formatUnits(result.maxFeePerGas ?? ZERO, 'gwei')
        const maxFeePerGas =
          activeNetwork.config.specialFeatures.hardcodedMaxFeePerGas ?? Math.ceil(parseFloat(maxFeePerGasStr))

        const maxPriorityFeePerGasStr = formatUnits(result.maxPriorityFeePerGas ?? ZERO, 'gwei')
        const maxPriorityFeePerGas =
          activeNetwork.config.specialFeatures.hardcodedMaxPriorityFeePerGas ??
          Math.ceil(parseFloat(maxPriorityFeePerGasStr))

        const data = { gasPrice, maxFeePerGas, maxPriorityFeePerGas }
        setGasData(data)
      })
      running.current = false
    }
    if (!latestBlock || running.current || !library) return

    fetchGasData()
  }, [chainId, latestBlock])

  return gasData
}

export const useGetFunctionGas = () => {
  const { activeNetwork } = useNetwork()
  const { activeWalletConnector } = useWallet()
  const { gasData } = useCachedData()

  const getGasConfig = useCallback(
    (_gasValue: number | undefined): GasConfiguration => {
      // null check and testnet check
      const gasValue = _gasValue ?? gasData?.gasPrice

      if (!activeWalletConnector || activeNetwork.isTestnet || !gasValue || !gasData) {
        return {}
      }

      // type 2 transaction
      if (activeWalletConnector.supportedTxTypes.includes(2) && activeNetwork.supportedTxTypes.includes(2))
        return {
          maxFeePerGas: getGasValue(gasData.maxFeePerGas),
          maxPriorityFeePerGas: getGasValue(gasData.maxPriorityFeePerGas),
          type: 2,
        }

      // legacy type 0 transaction
      return {
        gasPrice: getGasValue(gasValue),
      }
    },
    [activeNetwork, activeWalletConnector, gasData]
  )

  const getAutoGasConfig = useCallback((): GasConfiguration => getGasConfig(undefined), [getGasConfig])

  const gasConfig = useMemo(() => getAutoGasConfig(), [getAutoGasConfig])

  // this function is used for getting the gas limit for a transaction with a supported product
  const getSupportedProductGasLimit = useCallback(
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

  return { gasConfig, getGasConfig, getAutoGasConfig, getSupportedProductGasLimit }
}
