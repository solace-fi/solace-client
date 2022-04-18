import { BondName } from '../../enums'
import { TellerToken } from '../../types'
import { TELLER_ADDRS_V2 } from '../../addresses/auroraTestnet'
import {
  DAI_TOKEN,
  WETH9_TOKEN,
  USDC_TOKEN,
  USDT_TOKEN,
  WBTC_TOKEN,
  FRAX_TOKEN,
  NEAR_TOKEN,
  AURORA_TOKEN,
} from '../token'
import bondTellerErc20Abi_V2 from '../../metadata/BondTellerErc20_V2.json'
import bondTellerEthAbi_V2 from '../../metadata/BondTellerEth_V2.json'
import weth9 from '../../metadata/WETH9.json'
import ierc20Json from '../../metadata/IERC20Metadata.json'

const chainId = 1313161555

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
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    name: BondName.ETH,
    addr: WETH9_TOKEN.address[chainId],
    principalAbi: weth9,
    tellerAbi: bondTellerEthAbi_V2.abi,
    mainnetAddr: WETH9_TOKEN.address[1],
    tokenId: 'ethereum',
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
  [TELLER_ADDRS_V2.NEAR_TELLER]: {
    name: BondName.NEAR,
    addr: NEAR_TOKEN.address[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: '',
    tokenId: 'near',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.AURORA_TELLER]: {
    name: BondName.AURORA,
    addr: AURORA_TOKEN.address[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: AURORA_TOKEN.address[1],
    tokenId: 'aurora',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}
