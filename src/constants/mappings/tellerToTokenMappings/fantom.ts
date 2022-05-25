import { BondName } from '../../enums'
import { TellerTokenMetadata } from '../../types'
import { TELLER_ADDRS_V2 } from '../../addresses/fantomTestnet'
import { DAI_TOKEN, WETH9_TOKEN, USDC_TOKEN, USDT_TOKEN, WBTC_TOKEN, FRAX_TOKEN, WFTM_TOKEN } from '../token'
import bondTellerErc20Abi_V2 from '../../metadata/BondTellerErc20_V2.json'
import bondTellerFtm from '../../metadata/BondTellerFtm.json'
import wftm from '../../metadata/WFTM.json'
import ierc20Json from '../../metadata/IERC20Metadata.json'

const chainId = 250

export const tellerToTokenMapping: {
  [key: string]: TellerTokenMetadata
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
    tellerAbi: bondTellerErc20Abi_V2,
    mainnetAddr: WETH9_TOKEN.address[1],
    tokenId: 'ethereum',
    isBondTellerErc20: true,
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
  [TELLER_ADDRS_V2.FTM_TELLER]: {
    name: BondName.FTM,
    addr: WFTM_TOKEN.address[chainId],
    principalAbi: wftm,
    tellerAbi: bondTellerFtm,
    mainnetAddr: WFTM_TOKEN.address[1],
    tokenId: 'ftm',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}
