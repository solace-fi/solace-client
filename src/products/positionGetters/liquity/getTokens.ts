import { NetworkConfig } from '../../../constants/types'
import { getContract } from '../../../utils'

const ITroveManagerAbi = [
  {
    inputs: [{ internalType: 'address', name: '_borrower', type: 'address' }],
    name: 'Troves',
    outputs: [
      { internalType: 'uint256', name: '_debt', type: 'uint256' },
      { internalType: 'uint256', name: '_coll', type: 'uint256' },
      { internalType: 'uint256', name: '_stake', type: 'uint256' },
      { internalType: 'uint256', name: '_status', type: 'uint256' },
      { internalType: 'uint128', name: '_arrayIndex', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_borrower', type: 'address' }],
    name: 'getTroveColl',
    outputs: [{ internalType: 'uint256', name: '_coll', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_borrower', type: 'address' }],
    name: 'getTroveDebt',
    outputs: [{ internalType: 'uint256', name: '_debt', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_borrower', type: 'address' }],
    name: 'getTroveStake',
    outputs: [{ internalType: 'uint256', name: '_stake', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lqtyStaking',
    outputs: [{ internalType: 'address', name: '_lqtyStaking', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lqtyToken',
    outputs: [{ internalType: 'address', name: '_lqtyTokenAddress', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lusdToken',
    outputs: [{ internalType: 'address', name: '_lqtyStaking', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stabilityPool',
    outputs: [{ internalType: 'address', name: '_stabilityPool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const ILQTYStakingAbi = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'stakes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLQTYStaked',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const IStabilityPoolAbi = [
  {
    inputs: [{ internalType: 'address', name: '_depositor', type: 'address' }],
    name: 'getCompoundedLUSDDeposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_depositor', type: 'address' }],
    name: 'getDepositorLQTYGain',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getETH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalLUSDDeposits',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const getPositions = async (provider: any, activeNetwork: NetworkConfig) => {
  // mainnet addresses
  const user = '0x9Ada9Ae98457aD8a2D53DE2B888cd1337d3438E8'
  let TROVE_MANAGER_ADDRESS = '0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2'
  let LQTY_STAKING_ADDRESS = '0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d'
  let STABILITY_POOL_ADDRESS = '0x66017D22b0f8556afDd19FC67041899Eb65a21bb'
  if (activeNetwork.chainId == 4) {
    TROVE_MANAGER_ADDRESS = '0x04d630Bff6dea193Fd644dEcfC460db249854a02'
    LQTY_STAKING_ADDRESS = '0x988749E04e5B0863Da4E0Fdb1EaD85C1FA59fCe3'
    STABILITY_POOL_ADDRESS = '0xB8eb11f9eFF55378dfB692296C32DF020f5CC7fF'
  }

  const troveManagerContract = getContract(TROVE_MANAGER_ADDRESS, ITroveManagerAbi, provider)
  const lqtyStakingContract = getContract(LQTY_STAKING_ADDRESS, ILQTYStakingAbi, provider)
  const stabilityPoolContract = getContract(STABILITY_POOL_ADDRESS, IStabilityPoolAbi, provider)

  const troves = await troveManagerContract.functions.Troves(user)
  const stabilityPoolPosition = await stabilityPoolContract.functions.getCompoundedLUSDDeposit(user)
  const lqtyStakes = await lqtyStakingContract.functions.stakes(user)

  console.log('troves', troves)
  console.log('stabilityPoolPosition', stabilityPoolPosition)
  console.log('lqtyStakes', lqtyStakes)
}
