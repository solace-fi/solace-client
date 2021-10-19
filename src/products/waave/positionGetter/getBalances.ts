import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances } from '../../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import waaveTokenAbi from '../../../constants/abi/contracts/interface/Waave/IWaToken.sol/IWaToken.json'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = await getProductTokenBalances(user, waaveTokenAbi, tokens, provider)

  // get utoken balances
  const indices = rangeFrom0(balances.length)
  const contracts = balances.map((balance) => new Contract(balance.token.address, waaveTokenAbi, provider))
  const exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) =>
      (balances[i].underlying[0].balance = balances[i].token.balance
        .mul(exchangeRates[i])
        .div(String(getNonHumanValue(1, balances[i].token.decimals))))
  )

  // get native token balances
  const tokenBalances = await addNativeTokenBalances(
    balances,
    indices,
    activeNetwork.chainId,
    getMainNetworkTokenAddress
  )
  return tokenBalances
}

// rinkeby => mainnet underlying token map
const rmumap: any = {
  '0xc778417e063141139fce010982780140aa0cd5ab': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
}

// kovan => mainnet underlying token map
const kmumap: any = {
  '0xd0a1e359811322d97991e03f863a0c30c2cf029c': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0x13512979ade267ab5100878e2e0f485b568328a4': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0xd1b98b6607330172f1d991521145a22bce793277': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
}

export const getMainNetworkTokenAddress = (address: string, chainId: number): string => {
  if (chainId == 4) {
    return rmumap[address.toLowerCase()]
  }
  if (chainId == 42) {
    return kmumap[address.toLowerCase()]
  }
  return address.toLowerCase()
}

const queryExchangeRate = async (tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.pricePerShare())
}
