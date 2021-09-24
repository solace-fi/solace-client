import { BigNumber } from 'ethers'
import { LiquityPosition, NetworkConfig } from '../../../constants/types'
import { getContract } from '../../../utils'
import { Contract } from '@ethersproject/contracts'

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

export const getPositions = async (user: string, provider: any, activeNetwork: NetworkConfig): Promise<any> => {
  const troveManagerContract = getTroveContract(provider, activeNetwork.chainId)

  const stabilityPoolAddr: string = await troveManagerContract.stabilityPool()
  const lqtyStakingAddr: string = await troveManagerContract.lqtyStaking()
  const lusdTokenAddr: string = await troveManagerContract.lusdToken()
  const lqtyTokenAddr: string = await troveManagerContract.lqtyToken()

  const lqtyStakingContract = getContract(lqtyStakingAddr, ILQTYStakingAbi, provider)
  const stabilityPoolContract = getContract(stabilityPoolAddr, IStabilityPoolAbi, provider)

  const [, coll, , status, ,] = await troveManagerContract.functions.Troves(user)
  const stabilityPoolPosition = await stabilityPoolContract.functions.getCompoundedLUSDDeposit(user)
  const lqtyStakes = await lqtyStakingContract.functions.stakes(user)

  let positions: LiquityPosition[] = [
    {
      positionName: 'Stability Pool',
      positionAddress: stabilityPoolAddr,
      amount: stabilityPoolPosition[0],
      associatedToken: { address: lusdTokenAddr, name: 'LUSD', symbol: 'LUSD' },
    },
    {
      positionName: 'Staking Pool',
      positionAddress: lqtyStakingAddr,
      amount: lqtyStakes[0],
      associatedToken: { address: lqtyTokenAddr, name: 'LQTY', symbol: 'LQTY' },
    },
  ]

  if (status.eq(BigNumber.from(1)))
    positions = [
      {
        positionName: 'Trove',
        positionAddress: troveManagerContract.address,
        amount: coll,
        associatedToken: { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Ether', symbol: 'ETH' },
      },
      ...positions,
    ]
  return positions
}

export const getTroveContract = (provider: any, chainId: number): Contract => {
  let TROVE_MANAGER_ADDRESS = '0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2'
  if (chainId == 4) {
    TROVE_MANAGER_ADDRESS = String(process.env.REACT_APP_RINKEBY_LIQUITY_TROVE_MANAGER_ADDR)
  }
  return getContract(TROVE_MANAGER_ADDRESS, ITroveManagerAbi, provider)
}

// rinkeby => mainnet underlying token map
const rmumap: any = {
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // eth
  '0xf74dcabea0954aeb6903c8a71d41e468a6b77357': '0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d', // lqty
  '0x9c5ae6852622dde455b6fca4c1551fc0352531a3': '0x5f98805a4e8be255a32880fdec7f6728c6568ba0', // lusd
}

export const getMainNetworkTokenAddress = (address: string, chainId: number): string => {
  if (chainId == 4) {
    return rmumap[address.toLowerCase()]
  }
  return address.toLowerCase()
}
