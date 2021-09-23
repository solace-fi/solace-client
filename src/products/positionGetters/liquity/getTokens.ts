import { NetworkConfig, Token } from '../../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { ZERO } from '../../../constants'
import troveManagerAbi from '../../../constants/abi/contracts/interface/Liquity/ITroveManager.sol/ITroveManager.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  const troveManagerAddr =
    activeNetwork.chainId == 42
      ? String(process.env.REACT_APP_KOVAN_LIQUITY_TROVE_MANAGER_ADDR)
      : String(process.env.REACT_APP_RINKEBY_LIQUITY_TROVE_MANAGER_ADDR)

  const troveManagerContract = new Contract(troveManagerAddr, troveManagerAbi, provider)
  const stabilityPoolAddr: string = await troveManagerContract.stabilityPool()
  const lqtyStakingAddr: string = await troveManagerContract.lqtyStaking()
  const lusdTokenAddr: string = await troveManagerContract.lusdToken()
  const lqtyTokenAddr: string = await troveManagerContract.lqtyToken()

  const troveToken = {
    token: {
      address: troveManagerAddr,
      name: 'Trove',
      symbol: '',
      decimals: 0,
      balance: ZERO,
    },
    underlying: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      balance: ZERO,
    },
    eth: {
      balance: ZERO,
    },
  }

  const stabilityPoolToken: Token = {
    token: {
      address: stabilityPoolAddr,
      name: 'Stability Pool',
      symbol: '',
      decimals: 0,
      balance: ZERO,
    },
    underlying: {
      address: lusdTokenAddr,
      name: 'LUSD',
      symbol: 'LUSD',
      decimals: 18,
      balance: ZERO,
    },
    eth: {
      balance: ZERO,
    },
  }

  const stakingPoolToken: Token = {
    token: {
      address: lqtyStakingAddr,
      name: 'Staking Pool',
      symbol: '',
      decimals: 0,
      balance: ZERO,
    },
    underlying: {
      address: lqtyTokenAddr,
      name: 'LQTY',
      symbol: 'LQTY',
      decimals: 18,
      balance: ZERO,
    },
    eth: {
      balance: ZERO,
    },
  }

  const tokens: Token[] = [troveToken, stabilityPoolToken, stakingPoolToken]
  return tokens
}
