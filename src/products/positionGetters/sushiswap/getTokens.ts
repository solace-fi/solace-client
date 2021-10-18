import { NetworkConfig, Token } from '../../../constants/types'
import { ETHERSCAN_API_KEY } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'

import sushiLPTokenAbi from './_contracts/ISushiLPToken.json'

// const SushiV2Factory_ADDR = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
// import sushiV2FactoryAbi from './_contracts/ISushiV2Factory.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const tokens: Token[] = []

  if (!metadata.user || !metadata.transferHistory) return []

  const touchedSushiAddresses = metadata.transferHistory
    .filter((r: any) => r.tokenName == 'SushiSwap LP Token')
    .map((r: any) => r.contractAddress)

  const uniqueSushiAddresses = touchedSushiAddresses.filter(
    (item: string, index: number) => touchedSushiAddresses.indexOf(item) == index
  )

  for (let i = 0; i < uniqueSushiAddresses.length; i++) {
    const lpPairContract = getContract(uniqueSushiAddresses[i], sushiLPTokenAbi, provider)

    const balance = await lpPairContract.balanceOf(metadata.user)
    if (balance.gt(ZERO)) {
      const pairName: string = await lpPairContract.name()
      const pairSymbol: string = await lpPairContract.symbol()
      const pairDecimals: number = await lpPairContract.decimals()

      const token0 = await lpPairContract.token0()
      const token1 = await lpPairContract.token1()

      const token0Contract = getContract(token0, ierc20Json.abi, provider)
      const token1Contract = getContract(token1, ierc20Json.abi, provider)

      const [name0, symbol0, decimals0, name1, symbol1, decimals1] = await Promise.all([
        await token0Contract.name(),
        await token0Contract.symbol(),
        await token0Contract.decimals(),
        await token1Contract.name(),
        await token1Contract.symbol(),
        await token1Contract.decimals(),
      ])

      const token = {
        token: {
          address: uniqueSushiAddresses[i],
          name: pairName,
          symbol: pairSymbol,
          decimals: pairDecimals,
          balance: balance,
        },
        underlying: [
          {
            address: token0,
            name: name0,
            symbol: symbol0,
            decimals: decimals0,
            balance: ZERO,
          },
          {
            address: token1,
            name: name1,
            symbol: symbol1,
            decimals: decimals1,
            balance: ZERO,
          },
        ],
        eth: {
          balance: ZERO,
        },
      }

      tokens.push(token)
    }
  }

  return tokens
}
