import { Token } from '../../../constants/types'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { capitalizeFirstLetter } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'

const yregistryAbi = [
  {
    inputs: [{ internalType: 'address', name: '_vault', type: 'address' }],
    name: 'getVaultInfo',
    outputs: [
      { internalType: 'address', name: 'controller', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'strategy', type: 'address' },
      { internalType: 'bool', name: 'isWrapped', type: 'bool' },
      { internalType: 'bool', name: 'isDelegated', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVaults',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
]
const vaultAbi = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPricePerFullShare',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_shares', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const yRegistryAddress = '0x3eE41C098f9666ed2eA246f4D2558010e59d63A0'

export const getTokens = async (provider: any): Promise<Token[]> => {
  // TODO: reduce the ~1000 requests down
  if (!provider) return []
  const yregistry = getContract(yRegistryAddress, yregistryAbi, provider)
  const vaultAddrs = await yregistry.getVaults()
  const vaultInfos: any = await Promise.all(vaultAddrs.map((addr: any) => yregistry.getVaultInfo(addr)))

  const [vaultContracts, uTokenContracts] = await Promise.all([
    Promise.all(vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider))),
    Promise.all(vaultInfos.map((info: any) => getContract(info.token, ierc20Json.abi, provider))),
  ])

  const [vNames, vSymbols, vDecimals, uNames, uSymbols, uDecimals] = await Promise.all([
    Promise.all(vaultContracts.map((contract: any) => queryTokenName(contract))),
    Promise.all(vaultContracts.map((contract: any) => queryTokenSymbol(contract))),
    Promise.all(vaultContracts.map((contract: any) => queryTokenDecimals(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenName(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenSymbol(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenDecimals(contract))),
  ])
  const indices = rangeFrom0(vaultAddrs.length)
  const tokens: Token[] = indices.map((i) => {
    return {
      token: {
        address: vaultAddrs[i],
        name: capitalizeFirstLetter(vNames[i]),
        symbol: vSymbols[i],
        decimals: vDecimals[i],
        balance: ZERO,
      },
      underlying: {
        address: vaultInfos[i].token,
        name: uNames[i],
        symbol: uSymbols[i],
        decimals: uDecimals[i],
        balance: ZERO,
      },
      eth: {
        balance: ZERO,
      },
    }
  })
  return tokens
}

const queryTokenName = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.name())
}

const queryTokenSymbol = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.symbol())
}

const queryTokenDecimals = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify))
}
