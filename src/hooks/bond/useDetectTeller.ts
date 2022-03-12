import { useCallback, useEffect, useState } from 'react'
import { FunctionName } from '../../constants/enums'
import { FunctionGasLimits } from '../../constants/mappings/gasMapping'
import { NetworkConfig } from '../../constants/types'

/*
returns FunctionNames for BOND_DEPOSIT, BOND_DEPOSIT_W, and the functionGasLimits for those two functions
only for V2 and up
*/
export const useTellerConfig = (
  activeNetwork: NetworkConfig
): {
  bondDepositFunctionName: FunctionName
  bondDepositWrappedFunctionName: FunctionName
  bondDepositFunctionGas: number
  bondDepositWrappedFunctionGas: number
} => {
  const defaultEth = {
    bondDepositFunctionName: FunctionName.BOND_DEPOSIT_ETH_V2,
    bondDepositWrappedFunctionName: FunctionName.BOND_DEPOSIT_WETH_V2,
    bondDepositFunctionGas: FunctionGasLimits['tellerEth_v2.depositEth'],
    bondDepositWrappedFunctionGas: FunctionGasLimits['tellerEth_v2.depositWeth'],
  }
  const [config, setConfig] = useState<{
    bondDepositFunctionName: FunctionName
    bondDepositWrappedFunctionName: FunctionName
    bondDepositFunctionGas: number
    bondDepositWrappedFunctionGas: number
  }>(defaultEth)

  const getConfigs = useCallback(() => {
    switch (activeNetwork.chainId) {
      case 137:
      case 80001:
        setConfig({
          bondDepositFunctionName: FunctionName.BOND_DEPOSIT_MATIC,
          bondDepositWrappedFunctionName: FunctionName.BOND_DEPOSIT_WMATIC,
          bondDepositFunctionGas: FunctionGasLimits['tellerMatic.depositMatic'],
          bondDepositWrappedFunctionGas: FunctionGasLimits['tellerMatic.depositWmatic'],
        })
        break
      default:
        setConfig(defaultEth)
    }
  }, [activeNetwork])

  useEffect(() => {
    getConfigs()
  }, [getConfigs])

  return config
}
