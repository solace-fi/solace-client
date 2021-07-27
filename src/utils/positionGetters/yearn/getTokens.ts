import { Token } from '../../../constants/types'
import { getContract } from '../..'
import { rangeFrom0 } from '../../numeric'
import { ZERO } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { capitalizeFirstLetter } from '../../formatting'

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
  if (!provider) return []
  const yregistry = getContract(yRegistryAddress, yregistryAbi, provider)
  const vaultAddrs = await yregistry.getVaults()
  const vaultContracts = await Promise.all(vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider)))
  const vaultSymbols = await Promise.all(vaultContracts.map((vault: any) => vault.symbol()))
  const vaultInfos: any = await Promise.all(vaultAddrs.map((addr: any) => yregistry.getVaultInfo(addr)))

  const uTokenContracts = await Promise.all(
    vaultInfos.map((info: any) => getContract(info.token, ierc20Json.abi, provider))
  )
  const uTokenSymbols = await Promise.all(uTokenContracts.map((contract: any) => contract.symbol()))

  const [vNames, uNames, vDecimals, uDecimals] = await Promise.all([
    Promise.all(vaultContracts.map((contract: any) => contract.name())),
    Promise.all(uTokenContracts.map((contract: any) => contract.name())),
    Promise.all(vaultContracts.map((contract: any) => contract.decimals())),
    Promise.all(uTokenContracts.map((contract: any) => contract.decimals())),
  ])
  const indices = rangeFrom0(vaultAddrs.length)
  const tokens: Token[] = indices.map((i) => {
    return {
      token: {
        address: vaultAddrs[i],
        name: capitalizeFirstLetter(vNames[i]),
        symbol: vaultSymbols[i],
        decimals: vDecimals[i],
        balance: ZERO,
      },
      underlying: {
        address: vaultInfos[i].token,
        name: uNames[i],
        symbol: uTokenSymbols[i],
        decimals: uDecimals[i],
        balance: ZERO,
      },
      eth: {
        balance: ZERO,
      },
    }
  })
  console.log(tokens)
  return tokens
}
