import { constants } from 'ethers'

export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY
export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY

export const NUM_SECONDS_PER_DAY = 86400
export const NUM_BLOCKS_PER_DAY = 6450
export const NUM_DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 365
export const DEADLINE = constants.MaxUint256

export const ZERO = constants.Zero
export const ADDRESS_ZERO = constants.AddressZero
export const GAS_LIMIT = 800000
export const MAX_WIDTH = 1340 // max width that the app can expand up to

export const BKPT_1 = 480

export const BKPT_NAVBAR = 600

export const BKPT_2 = 770

export const BKPT_3 = 900

export const BKPT_4 = 1000

export const BKPT_5 = 1232

export const BKPT_6 = 1370

export const BKPT_7 = 1640

export const POW_NINE = 1000000000

export const CP_ROI = '150.5%'
export const LP_ROI = '6.0%'

export const MIN_RETRY_DELAY = 1000
export const RETRY_BACKOFF_FACTOR = 2
export const MAX_RETRY_DELAY = 10000

export const POLLING_INTERVAL = 12000

export const WALLET_CONNECT_BRIDGE = 'https://bridge.walletconnect.org'
