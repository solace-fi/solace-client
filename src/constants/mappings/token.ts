import { ReadTokenData } from '../types'

export const WETH9_TOKEN: ReadTokenData = {
  constants: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  address: {
    [1]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [3]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    [4]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    [5]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    [42]: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    [42161]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    [79377087078960]: '0xf8456e5e6A225C2C1D74D8C9a4cB2B1d5dc1153b',
    [56]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    [250]: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
    [137]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    [66]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    [128]: '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
    [1666600000]: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
    [100]: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
    [80001]: '0xb11CD68Cebb89E8ED0733B2C46B333Fb7a51816E',
    [43114]: '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15',
    [1313161554]: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
    [1313161555]: '0xfBc3957C8448824D6b7928f160331ec595D0dC0E',
  },
}

export const USDC_TOKEN: ReadTokenData = {
  constants: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  address: {
    [1]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [4]: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21',
    [42]: '0x512d93ADc3DF4E24cb4b26c44A91682Ec073F559',
    [137]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    [80001]: '0xca08aB81e4E437AcDda0E7505026bdD9A97b8B76',
    [1313161554]: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
    [1313161555]: '0xd0062b097a077F1c9DC97aE082a7FE58a0Be03a8',
  },
}

export const USDT_TOKEN: ReadTokenData = {
  constants: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  },
  address: {
    [1]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    [4]: '0x638b7BaA3D0C7d235fb904B01523883F980f24Ce',
    [42]: '0xAEA2B0F4763c8Ffc33A4c454CD08F803B02B6B53',
    [137]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    [80001]: '0x992fbE5C6fc9d5f09F4Fd85eF1FD331df078821C',
    [1313161554]: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
    [1313161555]: '0xb9D6BB8D150a566Eb93d097b9b65dc9b7455Dd67',
  },
}

export const DAI_TOKEN: ReadTokenData = {
  constants: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
  },
  address: {
    [1]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    [4]: '0x8ad3aA5d5ff084307d28C8f514D7a193B2Bfe725',
    [42]: '0x31a1D59460a9619ec6965a5684C6d3Ae470D0fE5',
    [137]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    [80001]: '0x829F3bc2f95E190fcf75Cca9D53ECd873404AeA4',
    [1313161554]: '0xe3520349F477A5F6EB06107066048508498A291b',
    [1313161555]: '0x87Eba7597721C156240Ae7d8aE26e269118AFdca',
  },
}

export const FRAX_TOKEN: ReadTokenData = {
  constants: {
    name: 'Frax',
    symbol: 'FRAX',
    decimals: 18,
  },
  address: {
    [1]: '0x853d955acef822db058eb8505911ed77f175b99e',
    [4]: '0x86E5B6485e28E52a0dEEd28Cc10772FeB9c4C400',
    [42]: '0x58B23b32a9774153E1E344762751aDfdca2764DD',
    [137]: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
    [80001]: '0xE338d08783CE3bdE2Cc03b137b196168641A8C05',
    [1313161554]: '0xda2585430fef327ad8ee44af8f1f989a2a91a3d2',
    [1313161555]: '0x5405059004A74d191a07badC3e32501ac8A39788',
  },
}

export const WBTC_TOKEN: ReadTokenData = {
  constants: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    decimals: 8,
  },
  address: {
    [1]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    [4]: '0x20fB9CDDbcA5a5EB468c76010AEc6eD4eAcc037F',
    [42]: '0x1063bf969F8D3D7296a2A94274D3df9202da2A3A',
    [137]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    [80001]: '0x7aD1341d3f29Cd6694fF43e284502A9eD3048E20',
    [1313161554]: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e',
    [1313161555]: '0x952349F445Ee8A2D546E1E8c963f3004A87e5f93',
  },
}

export const SCP_TOKEN: ReadTokenData = {
  constants: {
    name: 'Solace CP',
    symbol: 'SCP',
    decimals: 18,
  },
  address: {
    [1]: '0x501AcEe83a6f269B77c167c6701843D454E2EFA0',
    [4]: '0x501AcEe83a6f269B77c167c6701843D454E2EFA0',
    [42]: '0x501AcEe83a6f269B77c167c6701843D454E2EFA0',
  },
}

export const SOLACE_USDC_SLP_TOKEN: ReadTokenData = {
  constants: {
    name: 'SushiSwap LP Token',
    symbol: 'SLP',
    decimals: 18,
  },
  address: {
    [1]: '0x9C051F8A6648a51eF324D30C235da74D060153aC',
    [4]: '0x7BEc68fB902f90Ba84634E764C91fDfFCA04D084',
    [42]: '0x7BEc68fB902f90Ba84634E764C91fDfFCA04D084',
  },
}

export const WMATIC_TOKEN: ReadTokenData = {
  constants: {
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    decimals: 18,
  },
  address: {
    [1]: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    [137]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    [80001]: '0xaCCcDcEd4198c837d9A98E870F330697f94208f7',
  },
}

export const NEAR_TOKEN: ReadTokenData = {
  constants: {
    name: 'NEAR',
    symbol: 'NEAR',
    decimals: 18,
  },
  address: {
    [1313161554]: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d',
    [1313161555]: '0x80dAF9794A2b6f0A6B1E58c6Ae99803c028c00f8',
  },
}

export const AURORA_TOKEN: ReadTokenData = {
  constants: {
    name: 'Aurora',
    symbol: 'AURORA',
    decimals: 18,
  },
  address: {
    [1]: '0xaaaaaa20d9e0e2461697782ef11675f668207961',
    [1313161554]: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79',
    [1313161555]: '0x034c971902b0B2EF37abd249c1A5DEc5Dc5bE14B',
  },
}

export const SOLACE_TOKEN: ReadTokenData = {
  constants: {
    name: 'solace',
    symbol: 'SOLACE',
    decimals: 18,
  },
  address: {
    [1]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [4]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [42]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [137]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [80001]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [1313161554]: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    [1313161555]: '0x501ACE0C6DeA16206bb2D120484a257B9F393891',
  },
}

export const XSOLACE_TOKEN: ReadTokenData = {
  constants: {
    name: 'xsolace',
    symbol: 'xSOLACE',
    decimals: 18,
  },
  address: {
    [1]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [4]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [42]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [137]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [80001]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [1313161554]: '0x501ACe802447B1Ed4Aae36EA830BFBde19afbbF9',
    [1313161555]: '0x501ACEF0358fb055027A89AE46387a53C75498e0',
  },
}

export const XSOLACE_V1_TOKEN: ReadTokenData = {
  constants: {
    name: 'xsolace',
    symbol: 'xSOLACE',
    decimals: 18,
  },
  address: {
    [1]: '0x501AcE5aC3Af20F49D53242B6D208f3B91cfc411',
    [4]: '0x501AcE5aC3Af20F49D53242B6D208f3B91cfc411',
    [42]: '0x501AcE5aC3Af20F49D53242B6D208f3B91cfc411',
  },
}
