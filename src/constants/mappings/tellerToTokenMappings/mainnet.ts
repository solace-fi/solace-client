import { BondName } from '../../enums'
import { TellerTokenMetadata } from '../../types'
import { TELLER_ADDRS_V1, TELLER_ADDRS_V2 } from '../../addresses/mainnet'
import {
  DAI_TOKEN,
  FRAX_TOKEN,
  SCP_TOKEN,
  SOLACE_USDC_SLP_TOKEN,
  USDC_TOKEN,
  USDT_TOKEN,
  WBTC_TOKEN,
  WETH9_TOKEN,
} from '../token'

import bondTellerErc20Abi_V1 from '../../abi/BondTellerErc20.json'
import bondTellerEthAbi_V1 from '../../abi/BondTellerEth.json'

// import ierc20Json from '../../abi/IERC20Metadata.json'
// import weth9 from '../../abi/WETH9.json'
import sushiswapLpAbi from '../../abi/ISushiswapMetadataAlt.json'

import { ERC20_ABI, WETH9_ABI, BondTellerErc20_ABI, BondTellerEth_ABI } from '../../abi'

const chainId = 1

export const tellerToTokenMapping: {
  [key: string]: TellerTokenMetadata
} = {
  [TELLER_ADDRS_V1.DAI_TELLER]: {
    name: BondName.DAI,
    addr: DAI_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: DAI_TOKEN.address[1],
    tokenId: 'dai',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.ETH_TELLER]: {
    name: BondName.ETH,
    addr: WETH9_TOKEN.address[chainId],
    principalAbi: WETH9_ABI,
    tellerAbi: bondTellerEthAbi_V1,
    mainnetAddr: WETH9_TOKEN.address[1],
    tokenId: 'ethereum',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDC_TELLER]: {
    name: BondName.USDC,
    addr: USDC_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: USDC_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER]: {
    name: BondName.SOLACE_USDC_SLP,
    addr: SOLACE_USDC_SLP_TOKEN.address[chainId],
    principalAbi: sushiswapLpAbi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: SOLACE_USDC_SLP_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: true,
    sdk: 'sushi',
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.SCP_TELLER]: {
    name: BondName.SCP,
    addr: SCP_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: SCP_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.WBTC_TELLER]: {
    name: BondName.WBTC,
    addr: WBTC_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: WBTC_TOKEN.address[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDT_TELLER]: {
    name: BondName.USDT,
    addr: USDT_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: USDT_TOKEN.address[1],
    tokenId: 'tether',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
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
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    name: BondName.ETH,
    addr: WETH9_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerEth_ABI,
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
  [TELLER_ADDRS_V2.SCP_TELLER]: {
    name: BondName.SCP,
    addr: SCP_TOKEN.address[chainId],
    principalAbi: ERC20_ABI,
    tellerAbi: BondTellerErc20_ABI,
    mainnetAddr: SCP_TOKEN.address[1],
    tokenId: '',
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
