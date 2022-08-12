import { ReadToken } from '../types'

const tokens_Aurora = [
  { address: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', name: 'Aurora', symbol: 'AURORA', decimals: 18 },
  { address: '0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f', name: 'Aurigami Token', symbol: 'PLY', decimals: 18 },
  { address: '0x9f1F933C660a1DC856F0E0Fe058435879c5CCEf0', name: 'Bastion', symbol: 'BSTN', decimals: 18 },
  { address: '0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D', name: 'BlueBit Token', symbol: 'BBT', decimals: 18 },
  { address: '0xFa94348467f64D5A457F75F8bc40495D33c65aBB', name: 'Trisolaris', symbol: 'TRI', decimals: 18 },
  { address: '0x2451dB68DeD81900C4F16ae1af597E9658689734', name: 'vaporwave.finance', symbol: 'VWAVE', decimals: 18 },
  { address: '0xe3520349F477A5F6EB06107066048508498A291b', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  { address: '0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2', name: 'Frax', symbol: 'FRAX', decimals: 18 },
  { address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
  { address: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
]

export const coinsMap: { [key: number]: ReadToken[] } = {
  [1313161554]: tokens_Aurora,
}
