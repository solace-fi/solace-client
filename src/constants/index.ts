import { constants } from 'ethers'

export const ALCHEMY_ETHEREUM_API_KEY = process.env.REACT_APP_ALCHEMY_ETHEREUM_API_KEY
export const ALCHEMY_POLYGON_API_KEY = process.env.REACT_APP_ALCHEMY_POLYGON_API_KEY
export const ALCHEMY_GOERLI_API_KEY = process.env.REACT_APP_ALCHEMY_GOERLI_API_KEY
export const THEGRAPH_API_KEY = process.env.REACT_APP_THEGRAPH_API_KEY
export const POLYGONSCAN_API_KEY = process.env.REACT_APP_POLYGONSCAN_API_KEY
export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY
export const AURORASCAN_API_KEY = process.env.REACT_APP_AURORASCAN_API_KEY
export const FTMSCAN_API_KEY = process.env.REACT_APP_FTMSCAN_API_KEY

export const NUM_SECONDS_PER_DAY = 86400
export const NUM_BLOCKS_PER_DAY = 6450
export const NUM_DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 365
export const DEADLINE = constants.MaxUint256
export const MAX_APPROVAL_AMOUNT = constants.MaxUint256

export const ZERO = constants.Zero
export const ADDRESS_ZERO = constants.AddressZero
export const GAS_LIMIT = 800000
export const MAX_WIDTH = 1340 // max width that the app can expand up to

export const BKPT_1 = 380
export const BKPT_NAVBAR = 600
export const BKPT_2 = 770
export const BKPT_3 = 900
export const BKPT_4 = 1060
export const BKPT_5 = 1232
export const BKPT_6 = 1370
export const BKPT_7 = 1640

// z-index utils (intervals of 10 to allow custom z-indices in between)
const base = 0
const above = 10

const z0 = base
const z1 = above + z0
const z2 = above + z1
const z3 = above + z2

// page layout
export const Z_TABLE = z0
export const Z_FOOTER = z0
export const Z_NAV = z1
export const Z_MODAL = z2
export const Z_TOOLTIP = z3

export const POW_NINE = 1000000000

export const CP_ROI = '150.5%'
export const LP_ROI = '6.0%'

export const MIN_RETRY_DELAY = 1000
export const RETRY_BACKOFF_FACTOR = 2
export const MAX_RETRY_DELAY = 10000
export const MAX_BPS = 10000

export const POLLING_INTERVAL = 12000

export const WALLET_CONNECT_BRIDGE = 'https://bridge.walletconnect.org'

export const MARKETING_SITE = 'https://solace.fi'
