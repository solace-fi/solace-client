import { ReadToken } from '../types'

const coverageStablecoins_Mainnet = [
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
]

const coverageStablecoins_Rinkeby = [
  { address: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x8ad3aA5d5ff084307d28C8f514D7a193B2Bfe725', name: 'DAI Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xe28bef39f41c63b66cfd97bffdb6defc915b3c88', name: 'DAI Stablecoin', symbol: 'DAI', decimals: 18 },
]

const coverageStablecoins_Aurora = [
  { address: '0xe3520349F477A5F6EB06107066048508498A291b', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0xE4B9e004389d91e4134a28F19BD833cBA1d994B6', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0x5C92A4A7f59A9484AFD79DbE251AD2380E589783', name: 'BUSD BSC', symbol: 'abBUSD', decimals: 18 },
  { address: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
]

const coverageStablecoins_Polygon = [
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
]

const coverageStablecoins_Fantom = [
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
]

const coverageStablecoins_Fantom_Testnet = [
  { address: '0xC709a8965eF42fD80b28F226E253283539ddBb12', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0x87Eba7597721C156240Ae7d8aE26e269118AFdca', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0x1EE27c7c11E12dBa0F4b3aeEF9599D51Df06bB14', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0xC382931bF0D86B0Fd04ecAC093676A61446F3E2d', name: 'USD Token', symbol: 'USDT', decimals: 6 },
]

export const coinsMap: { [key: number]: ReadToken[] } = {
  [1]: coverageStablecoins_Mainnet,
  [4]: coverageStablecoins_Rinkeby,
  [1313161554]: coverageStablecoins_Aurora,
  [137]: coverageStablecoins_Polygon,
  [250]: coverageStablecoins_Fantom,
  [4002]: coverageStablecoins_Fantom_Testnet,
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
