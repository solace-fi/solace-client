import { NetworkConfig, Token } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'

import uniV2FactoryAbi from './_contracts/IUniV2Factory.json'
import uniLPTokenAbi from './_contracts/IUniLPToken.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  const uniV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
  const uniV2Contract = getContract(uniV2FactoryAddress, uniV2FactoryAbi, provider)

  const allPairsLength: BigNumber = await uniV2Contract.allPairsLength()
  const tokens: Token[] = []

  for (let i = 0; i < allPairsLength.toNumber(); i++) {
    const pairAddress = await uniV2Contract.allPairs(i)
    const lpPairContract = getContract(pairAddress, uniLPTokenAbi, provider)

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

    tokens.push({
      token: {
        address: pairAddress,
        name: pairName,
        symbol: pairSymbol,
        decimals: pairDecimals,
        balance: ZERO,
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
    })
  }

  return tokens
}
