import { ReadToken } from '../types'

const coverageStablecoins_Mainnet = [
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', name: 'Frax', symbol: 'FRAX', decimals: 18 },
]

const coverageStablecoins_Rinkeby = [
  { address: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x8ad3aA5d5ff084307d28C8f514D7a193B2Bfe725', name: 'DAI Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0x638b7BaA3D0C7d235fb904B01523883F980f24Ce', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0x86E5B6485e28E52a0dEEd28Cc10772FeB9c4C400', name: 'Frax', symbol: 'FRAX', decimals: 18 },
]

const coverageStablecoins_Aurora = [
  { address: '0xe3520349F477A5F6EB06107066048508498A291b', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
]

const coverageStablecoins_Aurora_Testnet = [
  { address: '0x87Eba7597721C156240Ae7d8aE26e269118AFdca', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xd0062b097a077F1c9DC97aE082a7FE58a0Be03a8', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0xb9D6BB8D150a566Eb93d097b9b65dc9b7455Dd67', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0x5405059004A74d191a07badC3e32501ac8A39788', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0xd1c08D4710154ED4CA111D752F92e9B184DB4d8c', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
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
  {
    address: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
    name: 'MAI',
    symbol: 'MAI',
    decimals: 18,
  },
]

const coverageStablecoins_Mumbai = [
  { address: '0x829F3bc2f95E190fcf75Cca9D53ECd873404AeA4', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xca08aB81e4E437AcDda0E7505026bdD9A97b8B76', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x992fbE5C6fc9d5f09F4Fd85eF1FD331df078821C', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0xE338d08783CE3bdE2Cc03b137b196168641A8C05', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0x5e8200F06Ed6B7bBC10f905b40D38eE453366a0B', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
]

const coverageStablecoins_Fantom = [
  { address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A', name: 'Frapped USDT', symbol: 'fUSDT', decimals: 6 },
  { address: '0xfB98B335551a418cD0737375a2ea0ded62Ea213b', name: 'MAI', symbol: 'MAI', decimals: 18 },
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
  { address: '0x5F1D856C7b3A8C71168775C4423A67A52F5493d1', name: 'Mai Stablecoin', symbol: 'MAI', decimals: 18 },
]

export const coinsMap: { [key: number]: ReadToken[] } = {
  [1]: coverageStablecoins_Mainnet,
  [4]: coverageStablecoins_Rinkeby,
  [1313161554]: coverageStablecoins_Aurora,
  [1313161555]: coverageStablecoins_Aurora_Testnet,
  [137]: coverageStablecoins_Polygon,
  [80001]: coverageStablecoins_Mumbai,
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
