import { ReadToken, ReadTokenData } from '../types'

export const coinsMap: { [key: number]: ReadToken[] } = {
  [1]: [
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', name: 'Binance USD', symbol: 'BUSD', decimals: 18 },
    { address: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', name: 'Fei USD', symbol: 'FEI', decimals: 18 },
    { address: '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86', name: 'Origin Dollar', symbol: 'OUSD', decimals: 18 },
    { address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', name: 'Synth sUSD', symbol: 'sUSD', decimals: 18 },
    { address: '0x0000000000085d4780B73119b644AE5ecd22b376', name: 'TrueUSD', symbol: 'TUSD', decimals: 18 },
    { address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', name: 'LUSD Stablecoin', symbol: 'LUSD', decimals: 18 },
    {
      address: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
      name: 'Magic Interney Money',
      symbol: 'MIM',
      decimals: 18,
    },
    { address: '0x1456688345527bE1f37E9e627DA0837D6f08C925', name: 'USDP Stablecoin', symbol: 'USDP', decimals: 18 },
    { address: '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5', name: 'mStable USD', symbol: 'mUSD', decimals: 18 },
    { address: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9', name: 'Alchemix USD', symbol: 'alUSD', decimals: 18 },
    {
      address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
      name: 'Aave Interest bearing DAI',
      symbol: 'aDAI',
      decimals: 18,
    },
    {
      address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
      name: 'Aave Interest bearing USDC',
      symbol: 'aUSDC',
      decimals: 6,
    },
    {
      address: '0x625aE63000f46200499120B906716420bd059240',
      name: 'Aave Interest bearing SUSD',
      symbol: 'aSUSD',
      decimals: 18,
    },
    {
      address: '0x4DA9b813057D04BAef4e5800E36083717b4a0341',
      name: 'Aave Interest bearing TUSD',
      symbol: 'aTUSD',
      decimals: 18,
    },
    {
      address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
      name: 'Aave Interest bearing USDT',
      symbol: 'aUSDT',
      decimals: 6,
    },
    {
      address: '0x6Ee0f7BB50a54AB5253dA0667B0Dc2ee526C30a8',
      name: 'Aave Interest bearing Binance USD',
      symbol: 'aBUSD',
      decimals: 18,
    },
    {
      address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
      name: 'Aave interest bearing DAI',
      symbol: 'aDAI',
      decimals: 18,
    },
    {
      address: '0xA361718326c15715591c299427c62086F69923D9',
      name: 'Aave Interest bearing BUSD',
      symbol: 'aBUSD',
      decimals: 18,
    },
    {
      address: '0x683923dB55Fead99A79Fa01A27EeC3cB19679cC3',
      name: 'Aave Interest bearing FEI',
      symbol: 'aFEI',
      decimals: 18,
    },
    {
      address: '0xd4937682df3C8aEF4FE912A96A74121C0829E664',
      name: 'Aave interest bearing FRAX',
      symbol: 'aFRAX',
      decimals: 18,
    },
    {
      address: '0x6C5024Cd4F8A59110119C56f8933403A539555EB',
      name: 'Aave interest bearing SUSD',
      symbol: 'aSUSD',
      decimals: 18,
    },
    {
      address: '0x101cc05f4A51C0319f570d5E146a8C625198e636',
      name: 'Aave Interest bearing TUSD',
      symbol: 'aTUSD',
      decimals: 18,
    },
    {
      address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
      name: 'Aave interest bearing USDC',
      symbol: 'aUSDC',
      decimals: 6,
    },
    {
      address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
      name: 'Aave interest bearing USDT',
      symbol: 'aUSDT',
      decimals: 6,
    },
  ],
  [1313161554]: [
    { address: '0xe3520349F477A5F6EB06107066048508498A291b', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0xE4B9e004389d91e4134a28F19BD833cBA1d994B6', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0x5C92A4A7f59A9484AFD79DbE251AD2380E589783', name: 'BUSD BSC', symbol: 'abBUSD', decimals: 18 },
    { address: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
  ],
  [137]: [
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      name: '(PoS) Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
    },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'USD Coin (PoS)', symbol: 'USDC', decimals: 6 },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: '(PoS) Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0x104592a158490a9228070E0A8e5343B499e125D0', name: 'Frax (PoS)', symbol: 'FRAX', decimals: 18 },
    { address: '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7', name: '(PoS) Binance USD', symbol: 'BUSD', decimals: 18 },
    { address: '0xc7031408C7978da9aCA03308CD104cb54E7A2EB3', name: 'Fei USD (PoS)', symbol: 'FEI', decimals: 18 },
    {
      address: '0x655BD74cd109ebDd0b030Eb4609B9214028f7729',
      name: 'Origin Dollar (PoS)',
      symbol: 'OUSD',
      decimals: 18,
    },
    { address: '0xF81b4Bec6Ca8f9fe7bE01CA734F55B2b6e03A7a0', name: 'Synth sUSD (PoS)', symbol: 'sUSD', decimals: 18 },
    { address: '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756', name: 'TrueUSD (PoS)', symbol: 'TUSD', decimals: 18 },
    {
      address: '0x23001f892c0C82b79303EDC9B9033cD190BB21c7',
      name: 'LUSD Stablecoin (PoS)',
      symbol: 'LUSD',
      decimals: 18,
    },
    {
      address: '0x49a0400587A7F65072c87c4910449fDcC5c47242',
      name: 'Magic Internet Money',
      symbol: 'MIM',
      decimals: 18,
    },
    {
      address: '0x01288e04435bFcd4718FF203D6eD18146C17Cd4b',
      name: 'Magic Internet Money (PoS)',
      symbol: 'MIM',
      decimals: 18,
    },
    {
      address: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
      name: 'miMATIC',
      symbol: 'miMATIC',
      decimals: 18,
    },
    {
      address: '0x27F8D03b3a2196956ED754baDc28D73be8830A6e',
      name: 'Aave Matic Market DAI',
      symbol: 'amDAI',
      decimals: 18,
    },
    {
      address: '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F',
      name: 'Aave Matic Market USDC',
      symbol: 'amUSDC',
      decimals: 6,
    },
    {
      address: '0x60D55F02A771d515e077c9C2403a1ef324885CeC',
      name: 'Aave Matic Market USDT',
      symbol: 'amUSDT',
      decimals: 6,
    },
    {
      address: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
      name: 'Aave Polygon DAI',
      symbol: 'aPolDAI',
      decimals: 18,
    },
    {
      address: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
      name: 'Aave Polygon USDC',
      symbol: 'aPolUSDC',
      decimals: 6,
    },
    {
      address: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
      name: 'Aave Polygon USDT',
      symbol: 'aPolUSDT',
      decimals: 6,
    },
  ],
  [250]: [
    { address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0xaf319E5789945197e365E7f7fbFc56B130523B33', name: 'Frax', symbol: 'FRAX', decimals: 18 },
    { address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A', name: 'Frapped USDT', symbol: 'fUSDT', decimals: 6 },
    { address: '0xAd84341756Bf337f5a0164515b1f6F993D194E1f', name: 'Fantom USD', symbol: 'fUSD', decimals: 18 },
    { address: '0x9879aBDea01a879644185341F7aF7d8343556B7a', name: 'TrueUSD', symbol: 'TUSD', decimals: 18 },
    { address: '0xfB98B335551a418cD0737375a2ea0ded62Ea213b', name: 'miMATIC', symbol: 'miMATIC', decimals: 18 },
    {
      address: '0x82f0B8B456c1A451378467398982d4834b6829c1',
      name: 'Magic Internet Money',
      symbol: 'MIM',
      decimals: 18,
    },
    { address: '0x07e6332dd090d287d3489245038daf987955dcfb', name: 'Geist Dai', symbol: 'gDAI', decimals: 18 },
    { address: '0xe578c856933d8e1082740bf7661e379aa2a30b26', name: 'Geist USDC', symbol: 'gUSDC', decimals: 6 },
    { address: '0x940f41f0ec9ba1a34cf001cc03347ac092f5f6b5', name: 'Geist fUSDT', symbol: 'gfUSDT', decimals: 6 },
    { address: '0xc664fc7b8487a3e10824cda768c1d239f2403bbe', name: 'Geist MIM', symbol: 'gMIM', decimals: 18 },
  ],
  [56]: [
    { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', name: 'Dai Token', symbol: 'DAI', decimals: 18 },
    {
      address: '0x1dC56F2705Ff2983f31fb5964CC3E19749A7CBA7',
      name: 'DAI-ERC20',
      symbol: 'anyDAI',
      decimals: 18,
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 18,
    },
    {
      address: '0x29cED01C447166958605519F10DcF8b0255fB379',
      name: 'Frax',
      symbol: 'FRAX',
      decimals: 18,
    },
    {
      address: '0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40',
      name: 'Frax',
      symbol: 'FRAX',
      decimals: 18,
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      name: 'BUSD Token',
      symbol: 'BUSD',
      decimals: 18,
    },
    {
      address: '0x14016E85a25aeb13065688cAFB43044C2ef86784',
      name: 'TrueUSD',
      symbol: 'TUSD',
      decimals: 18,
    },
    {
      address: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
      name: 'Mai Stablecoin',
      symbol: 'MAI',
      decimals: 18,
    },
  ],
}

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
    [137]: '0x38e7e05Dfd9fa3dE80dB0e7AC03AC57Fa832C78A', // Polygon
    [1313161554]: '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2', // Aurora
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
