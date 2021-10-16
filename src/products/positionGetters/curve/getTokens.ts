import { NetworkConfig, Token, TokenData } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ADDRESS_ZERO, ZERO } from '../../../constants'
import { AddressZero } from '@ethersproject/constants'
import { ETHERSCAN_API_KEY } from '../../../constants'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  if (!metadata.user) return []

  const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'
  const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)

  const registryAddr = await curveAddressProviderContract.get_registry()
  const curveRegistryContract = getContract(registryAddr, curveRegistryAbi, provider)

  const bigNumPoolCount: BigNumber = await curveRegistryContract.pool_count()

  // const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${
  //   metadata.user
  // }&startblock=0&endblock=latest&apikey=${String(ETHERSCAN_API_KEY)}`

  // const touchedCurveLpAddresses = await fetch(url)
  //   .then((res) => res.json())
  //   .then((result) => result.result)
  //   .then((result) => {
  //     if (result != 'Max rate limit reached')
  //       return result.filter((r: any) => r.tokenName.startsWith('Curve.fi')).map((r: any) => r.contractAddress)
  //     return []
  //   })

  // console.log(touchedCurveLpAddresses)

  // const uniqueCurveLpAddresses = touchedCurveLpAddresses.filter(
  //   (item: string, index: number) => touchedCurveLpAddresses.indexOf(item) == index
  // )

  const tokens: Token[] = []
  for (let i = 0; i < bigNumPoolCount.toNumber(); i++) {
    const poolAddr: string = await curveRegistryContract.pool_list(i)
    const lpTokenAddr: string = await curveRegistryContract.get_lp_token(poolAddr)

    const lpTokenContract = getContract(lpTokenAddr, ierc20Json.abi, provider)

    // const poolAddr = await curveRegistryContract.get_pool_from_lp_token(lpTokenAddr)

    const balance = await lpTokenContract.balanceOf(metadata.user)
    console.log(lpTokenAddr, balance)

    if (balance.gt(ZERO)) {
      const decimals: number = await lpTokenContract.decimals()

      const symbol: string = await lpTokenContract.symbol()

      const poolName: string = await curveRegistryContract.get_pool_name(poolAddr)

      const underlyingTokenAddrs = await curveRegistryContract.get_underlying_coins(poolAddr)

      const underlyingTokens: TokenData[] = []

      for (let j = 0; j < underlyingTokenAddrs.length; j++) {
        if (underlyingTokenAddrs[j] != ADDRESS_ZERO) {
          const underlyingTokenContract = getContract(underlyingTokenAddrs[j], ierc20Json.abi, provider)
          const name = await underlyingTokenContract.name()
          const symbol = await underlyingTokenContract.symbol()
          const decimals = await underlyingTokenContract.decimals()
          underlyingTokens.push({
            address: underlyingTokenAddrs[j],
            name: name,
            symbol: symbol,
            decimals: decimals,
            balance: ZERO,
          })
        }
      }

      const token = {
        token: {
          address: lpTokenAddr,
          name: poolName,
          symbol: symbol,
          decimals: decimals,
          balance: ZERO,
        },
        underlying: underlyingTokens,
        eth: {
          balance: ZERO,
        },
      }

      tokens.push(token)
    }
  }
  console.log(tokens)
  return tokens
}
