import { NetworkConfig, Token } from '../../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { ZERO } from '../../../constants'
import { withBackoffRetries } from '../../../utils/time'
import { numberify, rangeFrom0 } from '../../../utils/numeric'

import waaveRegistryAbi from '../../../constants/abi/contracts/interface/Waave/IWaRegistry.sol/IWaRegistry.json'
import waaveTokenAbi from '../../../constants/abi/contracts/interface/Waave/IWaToken.sol/IWaToken.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const waaveRegistryAddr =
    activeNetwork.chainId == 42
      ? String(process.env.REACT_APP_KOVAN_WA_REGISTRY_ADDR)
      : String(process.env.REACT_APP_RINKEBY_WA_REGISTRY_ADDR)

  const waaveRegistryContract = new Contract(waaveRegistryAddr, waaveRegistryAbi, provider)
  const waaveTokenAddresses: string[] = await waaveRegistryContract.getAllWaTokens()
  const waaveTokenContracts = waaveTokenAddresses.map(
    (address: string) => new Contract(address, waaveTokenAbi, provider)
  )

  const utokenAddresses = await Promise.all(waaveTokenContracts.map((contract: any) => queryUnderLying(contract)))

  const utokenContracts = utokenAddresses.map((address: any) => new Contract(address, waaveTokenAbi, provider))

  const [
    watokenNames,
    watokenSymbols,
    watokenDecimals,
    utokenNames,
    utokenSymbols,
    utokenDecimals,
  ] = await Promise.all([
    Promise.all(waaveTokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(waaveTokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(waaveTokenContracts.map(queryTokenDecimals)),
    Promise.all(utokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(utokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(utokenContracts.map(queryTokenDecimals)),
  ])

  const indices = rangeFrom0(waaveTokenAddresses.length)
  const tokens = indices.map((i) => {
    const token: Token = {
      token: {
        address: waaveTokenAddresses[i].toLowerCase(),
        name: watokenNames[i],
        symbol: watokenSymbols[i],
        decimals: watokenDecimals[i],
        balance: ZERO,
      },
      underlying: [
        {
          address: utokenAddresses[i].toLowerCase(),
          name: utokenNames[i],
          symbol: utokenSymbols[i],
          decimals: utokenDecimals[i],
          balance: ZERO,
        },
      ],
      eth: {
        balance: ZERO,
      },
      tokenType: 'token',
    }
    return token
  })
  return tokens
}

const queryUnderLying = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.underlying())
}

const queryTokenName = async (tokenContract: any, provider: any) => {
  return await withBackoffRetries(async () => tokenContract.name())
}

const queryTokenSymbol = async (tokenContract: any, provider: any) => {
  return await withBackoffRetries(async () => tokenContract.symbol())
}

const queryTokenDecimals = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify))
}
