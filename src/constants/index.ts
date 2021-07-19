import { constants } from 'ethers'

export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY
export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY

export const DEFAULT_CHAIN_ID = 4
export const NUM_BLOCKS_PER_DAY = 6450
export const NUM_DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 365
export const MAX_WIDTH = 1340

export const TOKEN_NAME = 'Solace CP Token'
export const TOKEN_SYMBOL = 'SCP'
export const DEADLINE = constants.MaxUint256
export const ZERO = constants.Zero
export const ADDRESS_ZERO = constants.AddressZero
export const GAS_LIMIT = 800000
export const MAX_FULL_SCREEN_WIDTH = 1300
export const MAX_MOBILE_SCREEN_WIDTH = 670
export const MAX_PRICES_SCREEN_WIDTH = 1040

export const POW_NINE = 1000000000
export const POW_EIGHTEEN = 1000000000000000000

export const CP_ROI = '150.5%'
export const LP_ROI = '6.0%'
