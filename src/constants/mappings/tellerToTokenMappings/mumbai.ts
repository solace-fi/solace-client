import { BondName } from '../../enums'
import { TellerTokenMetadata } from '../../types'
import { DAI_TOKEN, WETH9_TOKEN, USDC_TOKEN, USDT_TOKEN, WBTC_TOKEN, FRAX_TOKEN, WMATIC_TOKEN } from '../token'

import { TELLER_ADDRS_V2 } from '../../addresses/mumbai'

import { BondTellerErc20_ABI, BondTellerMatic_ABI, ERC20_ABI, WMATIC_ABI } from '../../abi'

const chainId = 80001

export const tellerToTokenMapping: {
  [key: string]: TellerTokenMetadata
} = {
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    name: BondName.DAI,
    addr: DAI_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: DAI_TOKEN.address[1],
    tokenId: 'dai',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WETH_TELLER]: {
    name: BondName.WETH,
    addr: WETH9_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: WETH9_TOKEN.address[1],
    tokenId: 'ethereum',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.MATIC_TELLER]: {
    name: BondName.MATIC,
    addr: WMATIC_TOKEN.address[chainId],
    principalAbi: WMATIC_ABI,
    tellerAbi: BondTellerMatic_ABI,
    mainnetAddr: WMATIC_TOKEN.address[1],
    tokenId: 'matic-network',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    name: BondName.USDC,
    addr: USDC_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: USDC_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    name: BondName.WBTC,
    addr: WBTC_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: WBTC_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    name: BondName.USDT,
    addr: USDT_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: USDT_TOKEN.address[1],
    tokenId: 'tether',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    name: BondName.FRAX,
    addr: FRAX_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: FRAX_TOKEN.address[1],
    tokenId: 'frax',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}
