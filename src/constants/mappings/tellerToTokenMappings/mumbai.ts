import { BondName } from '../../enums'
import { TellerToken } from '../../types'
import { DAI_TOKEN, WETH9_TOKEN, USDC_TOKEN, USDT_TOKEN, WBTC_TOKEN, FRAX_TOKEN, WMATIC_TOKEN } from '../token'

import { TELLER_ADDRS_V2 } from '../../addresses/mumbai'

import bondTellerErc20Abi_V2 from '../../metadata/BondTellerErc20_V2.json'
import bondTellerMaticAbi from '../../metadata/BondTellerMatic.json'

import ierc20Json from '../../metadata/IERC20Metadata.json'
import wmatic from '../../metadata/WMATIC.json'

const chainId = 80001

export const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    name: BondName.DAI,
    addr: DAI_TOKEN.address[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
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
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
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
    principalAbi: wmatic.abi,
    tellerAbi: bondTellerMaticAbi.abi,
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
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
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
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
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
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
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
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: FRAX_TOKEN.address[1],
    tokenId: 'frax',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}
