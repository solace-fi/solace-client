import { NetworkCache, NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances } from '../getBalances'
import { withBackoffRetries } from '../../../utils/time'
import troveManagerAbi from '../../../constants/abi/contracts/interface/Liquity/ITroveManager.sol/ITroveManager.json'
import stabilityPoolAbi from '../../../constants/abi/contracts/interface/Liquity/IStabilityPool.sol/IStabilityPool.json'
import stakingAbi from '../../../constants/abi/contracts/interface/Liquity/ILQTYStaking.sol/ILQTYStaking.json'

export const getBalances = async (
  user: string,
  provider: any,
  cache: NetworkCache,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  for (const t of tokens) {
    if (t.token.name === 'Trove') {
      const troveManager = new Contract(t.token.address, troveManagerAbi, provider)
      const [, coll, , status, ,] = await troveManager.Troves(user)
      if (status == 1) {
        t.token.balance = coll
        t.underlying.balance = coll
      }
    } else if (t.token.name === 'Stability Pool') {
      const stabilityPool = new Contract(t.token.address, stabilityPoolAbi, provider)
      const balance = await stabilityPool.getCompoundedLUSDDeposit(user)
      t.token.balance = balance
      t.underlying.balance = balance
    } else if (t.token.name === 'Staking Pool') {
      const stakingPool = new Contract(t.token.address, stakingAbi, provider)
      const balance = await stakingPool.stakes(user)
      t.token.balance = balance
      t.underlying.balance = balance
    }
  }
  // filter 0 amount tokens
  tokens = tokens.filter((t) => t.token.balance.gt(0))

  // get native token balances
  const indices = rangeFrom0(tokens.length)
  const tokenBalances = await addNativeTokenBalances(tokens, indices, cache.chainId, getMainNetworkTokenAddress)
  return tokenBalances
}

// rinkeby => mainnet underlying token map
const rmumap: any = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
  '0xF74dcAbeA0954AeB6903c8a71d41e468a6B77357': '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D', // LQTY
  '0x9C5AE6852622ddE455B6Fca4C1551FC0352531a3': '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', // LUSD
}

const getMainNetworkTokenAddress = (address: string, chainId: number): string => {
  if (chainId == 4) {
    return rmumap[address.toLowerCase()]
  }
  return address.toLowerCase()
}
