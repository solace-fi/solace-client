import { WalletConnector } from '../wallet'
import { NetworkConfig } from '../constants/types'
import { getGasValue } from './formatting'

export const getGasConfig = (
  activeWalletConnector: WalletConnector | undefined,
  activeNetwork: NetworkConfig,
  gasValue: any
): any => {
  if (!activeWalletConnector || !gasValue) return {}
  if (activeWalletConnector.supportedTxTypes.includes(2) && activeNetwork.supportedTxTypes.includes(2))
    return {
      maxFeePerGas: getGasValue(gasValue),
      type: 2,
    }
  return {
    gasPrice: getGasValue(gasValue),
  }
}
