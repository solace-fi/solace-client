import { NetworkConfig, Token } from '../../../constants/types'
import { ETHERSCAN_API_KEY } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'

import factoryAbi from './_contracts/IUniswapV3Factory.json'
import lpTokenAbi from './_contracts/IUniswapLpToken.json'
import positionManagerAbi from '../../../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { listTokensOfOwner } from '../../../utils/token'
import { BigNumber } from 'ethers'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const tokens: Token[] = []
  if (!provider) return []
  if (!metadata.user) return []

  const UNISWAPV3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  const UNISWAPV3_POSITION_MANAGER_ADDR = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

  const factoryContract = getContract(UNISWAPV3_FACTORY_ADDR, factoryAbi, provider)
  const positionManager = getContract(UNISWAPV3_POSITION_MANAGER_ADDR, positionManagerAbi.abi, provider)

  const tokenIds = await listTokensOfOwner(positionManager, metadata.user)

  const positions = await Promise.all(tokenIds.map((id) => positionManager.positions(id)))

  for (let i = 0; i < positions.length; i++) {
    const liquidity = positions[i].liquidity
    if (liquidity.gt(ZERO)) {
      const token0 = positions[i].token0
      const token1 = positions[i].token1
      const fee = positions[i].fee

      const tickLower: number = positions[i].tickLower
      const tickUpper: number = positions[i].tickUpper

      // console.log(token0, token1, fee, liquidity, tickLower, tickUpper)

      const poolAddress = await factoryContract.getPool(token0, token1, fee)

      const token0Contract = getContract(token0, ierc20Json.abi, provider)
      const token1Contract = getContract(token1, ierc20Json.abi, provider)

      const [name0, symbol0, decimals0, name1, symbol1, decimals1] = await Promise.all([
        token0Contract.name(),
        token0Contract.symbol(),
        token0Contract.decimals(),
        token1Contract.name(),
        token1Contract.symbol(),
        token1Contract.decimals(),
      ])

      const token: Token = {
        token: {
          address: poolAddress,
          name: `#${tokenIds[i]} - ${name0}/${name1}`,
          symbol: `UNI-V3-POS`,
          decimals: 18,
          balance: liquidity,
        },
        underlying: [
          {
            address: token0,
            name: name0,
            symbol: symbol0,
            decimals: decimals0,
            balance: BigNumber.from(tickLower),
          },
          {
            address: token1,
            name: name1,
            symbol: symbol1,
            decimals: decimals1,
            balance: BigNumber.from(tickUpper),
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
