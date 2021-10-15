import { NetworkConfig, Token } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'
  const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)

  const registryAddr = await curveAddressProviderContract.get_registry()
  const curveRegistryContract = getContract(registryAddr, curveRegistryAbi.abi, provider)

  const bigNumPoolCount: BigNumber = await curveRegistryContract.pool_count()
  const indices = rangeFrom0(bigNumPoolCount.toNumber())

  const tokens: Token[] = await Promise.all(
    indices.map(async (i) => {
      const poolAddr = await curveRegistryContract.functions.pool_list(i)
      const lpTokenAddr = await curveRegistryContract.functions.get_lp_token(poolAddr.pool)

      const lpTokenContract = getContract(lpTokenAddr.token, ierc20Json.abi, provider)

      const lpTokenAddress: string = lpTokenAddr.token

      const decimals: number = await lpTokenContract.decimals()

      const symbol: string = await lpTokenContract.symbol()

      const poolName: string = await curveRegistryContract.get_pool_name(poolAddr.pool)

      return {
        token: {
          address: lpTokenAddress,
          name: poolName,
          symbol: symbol,
          decimals: decimals,
          balance: ZERO,
        },
        underlying: [
          {
            address: '',
            name: '',
            symbol: '',
            decimals: 18,
            balance: ZERO,
          },
        ],
        eth: {
          balance: ZERO,
        },
      }
    })
  )
  return tokens
}
