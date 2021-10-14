import { NetworkConfig, Token } from '../../../constants/types'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { capitalizeFirstLetter } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import { vaultAbi, yregistryAbi } from './_contracts/yearnAbis'
import { BigNumber } from 'ethers'

const yRegistryAddress = '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  // TODO: reduce the ~1000 requests down
  if (!provider) return []
  const yregistry = getContract(yRegistryAddress, yregistryAbi, provider)
  const bigNumTokens = await yregistry.numTokens()
  const numTokens = bigNumTokens.toNumber()
  const tokenCount = rangeFrom0(numTokens)

  const uTokenAddrs = await Promise.all(tokenCount.map((i) => yregistry.tokens(BigNumber.from(tokenCount[i]))))
  const vaultAddrs = await Promise.all(uTokenAddrs.map((token) => yregistry.latestVault(token)))

  const [vaultContracts, uTokenContracts] = await Promise.all([
    Promise.all(vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider))),
    Promise.all(uTokenAddrs.map((addr: any) => getContract(addr, ierc20Json.abi, provider))),
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
        address: uTokenAddrs[i],
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
  // console.table([
  //   tokens.map((t) => t.token.name),
  //   tokens.map((t) => t.token.address),
  //   tokens.map((t) => t.underlying.name),
  //   tokens.map((t) => t.underlying.address),
  // ])
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
