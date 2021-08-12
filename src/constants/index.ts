import { constants } from 'ethers'

export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY
export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY

export const NUM_BLOCKS_PER_DAY = 6450
export const NUM_DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 365
export const DEADLINE = constants.MaxUint256

export const ZERO = constants.Zero
export const ADDRESS_ZERO = constants.AddressZero
export const GAS_LIMIT = 800000

export const MAX_NAVBAR_SCREEN_WIDTH = 1300
export const MAX_MOBILE_SCREEN_WIDTH = 670
export const MAX_TABLET_SCREEN_WIDTH = 1080
export const MAX_WIDTH = 1340

export const MOBILE_SCREEN_MARGIN = 20

export const POW_NINE = 1000000000
export const POW_EIGHTEEN = 1000000000000000000

export const CP_ROI = '150.5%'
export const LP_ROI = '6.0%'

export const MIN_RETRY_DELAY = 1000
export const RETRY_BACKOFF_FACTOR = 2
export const MAX_RETRY_DELAY = 10000

export const POLLING_INTERVAL = 12000

export const RPC_URLS = {
  1: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  4: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  42: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
}

export const WALLET_CONNECT_BRIDGE = 'https://bridge.walletconnect.org'
