import { NetworkConfig, Token } from '../../../constants/types'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { rangeFrom0 } from '../../../utils/numeric'
import { addNativeTokenBalances, getProductTokenBalances } from '../getBalances'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  // get atoken balances
  const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  //get utoken balances
  const indices = rangeFrom0(balances.length)
  indices.forEach((i) => (balances[i].underlying.balance = balances[i].token.balance))

  //get native token balances
  const tokenBalances = await addNativeTokenBalances(
    balances,
    indices,
    activeNetwork.chainId,
    getMainNetworkTokenAddress
  )
  return tokenBalances
}

// kovan => mainnet underlying token map
const kmumap: any = {
  '0xb597cd8d3217ea6477232f9217fa70837ff667af': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf': '0x4fabb145d64652a948d72533023f6e7a623c7c53',
  '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xc64f90cd7b564d3ab580eb20a102a8238e218be2': '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
  '0x3f80c39c0b96a0945f9f0e9f55d8a8891c5671a8': '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
  '0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789': '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0x738dc6380157429e957d223e6333dc385c85fec7': '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  '0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa': '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  '0x5eebf65a6746eed38042353ba84c8e37ed58ac6f': '0x408e41876cccdc0f92210600ef50372656052a38',
  '0x7fdb81b0b8a010dd4ffc57c3fecbf145ba8bd947': '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  '0x99b267b9d96616f906d53c26decf3c5672401282': '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
  '0x016750ac630f711882812f24dba6c95b9d35856d': '0x0000000000085d4780b73119b644ae5ecd22b376',
  '0xe22da380ee6b445bb8273c81944adeb6e8450422': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x13512979ade267ab5100878e2e0f485b568328a4': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0xd1b98b6607330172f1d991521145a22bce793277': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xd0a1e359811322d97991e03f863a0c30c2cf029c': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xb7c325266ec274feb1354021d27fa3e3379d840d': '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
  '0xd0d76886cf8d952ca26177eb7cfdf83bad08c00c': '0xe41d2489571d322189246dafa5ebde1f4699f498',
  '0x075a36ba8846c6b6f53644fdd3bf17e5151789dc': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0x3e0437898a5667a4769b1ca5a34aab1ae7e81377': '0xd46ba6d942050d489dbd938a2c909a5d5039a161',
}

export const getMainNetworkTokenAddress = (address: string, chainId: number): string => {
  if (chainId == 42) {
    return kmumap[address.toLowerCase()]
  }
  return address.toLowerCase()
}
