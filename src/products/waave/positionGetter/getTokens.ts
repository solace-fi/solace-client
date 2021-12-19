import { NetworkConfig, Token } from '../../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { ZERO } from '../../../constants'
// import { withBackoffRetries } from '../../../utils/time'
import { /* numberify,*/ rangeFrom0 } from '../../../utils/numeric'

import waaveRegistryAbi from '../../../constants/abi/contracts/interface/Waave/IWaRegistry.sol/IWaRegistry.json'
import waaveTokenAbi from '../../../constants/abi/contracts/interface/Waave/IWaToken.sol/IWaToken.json'
import { queryDecimals, queryName, querySymbol, queryUnderLying } from '../../../utils/contract'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig /*, metadata?: any*/): Promise<Token[]> => {
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
    Promise.all(waaveTokenContracts.map((contract: any) => queryName(contract, provider))),
    Promise.all(waaveTokenContracts.map((contract: any) => querySymbol(contract, provider))),
    Promise.all(waaveTokenContracts.map(queryDecimals)),
    Promise.all(utokenContracts.map((contract: any) => queryName(contract, provider))),
    Promise.all(utokenContracts.map((contract: any) => querySymbol(contract, provider))),
    Promise.all(utokenContracts.map(queryDecimals)),
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
