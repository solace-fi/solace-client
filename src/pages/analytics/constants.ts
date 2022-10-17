import { BKPT_5, BKPT_4, BKPT_2, BKPT_1 } from '../../constants'
import { AnalyticsChart } from '../../constants/enums/analytics'

export const rowHeight = 100
export const margin = 10
export const cardPadding = 32
export const titlePortion = 124

export const cardUnchartable = cardPadding + titlePortion
export const interval = rowHeight + margin

const {
  PREMIUMS_STAT,
  UWP_SIZE_STAT,
  LEVERAGE_FACTOR_STAT,
  MAX_EXPOSURE_STAT,
  TOKEN_COMPOSITION_TABLE,
  PORTFOLIO_AREA_CHART,
  PORTFOLIO_VOL_HISTOGRAM,
  TOKEN_PRICE_VOL_HISTOGRAM,
  TOKEN_RADIAL_PIE_CHART,
  TOKEN_WEIGHTS_AREA_CHART,
  PREMIUMS_LINE_CHART,
  SPI_EXPOSURES_TABLE_APPID,
  SPI_EXPOSURES_TABLE_POLICY,
  COVER_LIMIT_PER_CATEGORY_PIE_CHART,
  GAUGE_OVERVIEW_TABLE,
} = AnalyticsChart

export const breakpointsObj = { lg: BKPT_5, md: BKPT_4, sm: BKPT_2, xs: BKPT_1, xxs: 0 }
export const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export const layoutLG = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizable: false },
  { i: MAX_EXPOSURE_STAT, x: 6, y: 0, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 5, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 8, h: 5, minH: 4, maxH: 10, minW: 3, maxW: cols.lg },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: cols.lg, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.lg },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: cols.lg, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.lg },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 9, h: 4, minW: 3, minH: 4, maxH: 10, maxW: cols.lg },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: cols.lg },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 4, y: 24, w: 9, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.lg },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 28, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: GAUGE_OVERVIEW_TABLE, x: 0, y: 32, w: 3, h: 8, minW: 2, minH: 3, maxH: 8, maxW: 5 },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 3, y: 32, w: 9, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.lg },
]

export const layoutMD = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizable: false },
  { i: MAX_EXPOSURE_STAT, x: 6, y: 0, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 4, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: cols.md },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: cols.md, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.md },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: cols.md, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.md },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 7, h: 4, minW: 3, minH: 4, maxH: 10, maxW: cols.md },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: cols.md },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 4, y: 24, w: 7, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.md },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 28, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: GAUGE_OVERVIEW_TABLE, x: 0, y: 28, w: 3, h: 8, minW: 2, minH: 3, maxH: 10, maxW: 5 },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 3, y: 31, w: 7, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.md },
]

export const layoutSM = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 2, h: 1, isResizable: false },
  { i: MAX_EXPOSURE_STAT, x: 0, y: 3, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 4, h: 4, minH: 3, maxH: 6, minW: 3, maxW: cols.sm },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: cols.sm, h: 4, minH: 4, maxH: 10, minW: 3, maxW: cols.sm },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: cols.sm, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.sm },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: cols.sm, h: 5, minH: 4, maxH: 10, minW: 4, maxW: cols.sm },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 16, w: 3, h: 4, minW: 3, minH: 4, maxH: 10, maxW: cols.sm },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: cols.sm, h: 4, minW: 2, minH: 2, maxH: 10, maxW: cols.sm },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 0, y: 28, w: cols.sm, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.sm },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 34, w: cols.sm, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.sm },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 42, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: GAUGE_OVERVIEW_TABLE, x: 3, y: 42, w: 3, h: 4, minW: 2, minH: 3, maxH: 7, maxW: 5 },
]

export const layoutXS = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 1, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 1, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 1, h: 1, isResizable: false },
  { i: MAX_EXPOSURE_STAT, x: 0, y: 3, w: 1, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 1, y: 1, w: 3, h: 4, minH: 3, maxH: 6, minW: 3, maxW: cols.xs },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: cols.xs, h: 4, minH: 4, maxH: 10, minW: 3, maxW: cols.xs },
  {
    i: PORTFOLIO_VOL_HISTOGRAM,
    x: 0,
    y: 6,
    w: cols.xs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: cols.xs,
    maxW: cols.xs,
  },
  {
    i: TOKEN_PRICE_VOL_HISTOGRAM,
    x: 0,
    y: 11,
    w: cols.xs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: cols.xs,
    maxW: cols.xs,
  },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: cols.xs, h: 4, minH: 4, maxH: 6, minW: 3, maxW: cols.xs },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 0, y: 20, w: cols.xs, h: 4, minW: 3, minH: 4, maxH: 10, maxW: cols.xs },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: cols.xs, h: 4, minW: 2, minH: 2, maxH: 10, maxW: cols.xs },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 0, y: 28, w: cols.xs, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.xs },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 32, w: cols.xs, h: 8, minW: 2, minH: 4, maxH: 10, maxW: cols.xs },
  {
    i: COVER_LIMIT_PER_CATEGORY_PIE_CHART,
    x: 0,
    y: 40,
    w: cols.xs,
    h: 4,
    minH: 4,
    maxH: 6,
    minW: 3,
    maxW: cols.xs,
  },
  { i: GAUGE_OVERVIEW_TABLE, x: 0, y: 44, w: cols.xs, h: 4, minW: 2, minH: 3, maxH: 7, maxW: cols.xs },
]

export const layoutXXS = [
  { i: PREMIUMS_STAT, x: 0, y: 1, w: 1, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 0, w: cols.xxs, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 1, y: 1, w: 1, h: 1, isResizable: false },
  { i: MAX_EXPOSURE_STAT, x: 0, y: 1, w: cols.xxs, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 3, h: 5, minH: 3, maxH: 6, minW: cols.xxs, maxW: cols.xxs },
  {
    i: PORTFOLIO_AREA_CHART,
    x: 4,
    y: 1,
    w: cols.xxs,
    h: 7,
    minH: 7,
    maxH: 10,
    minW: cols.xxs,
    maxW: cols.xxs,
  },
  {
    i: PORTFOLIO_VOL_HISTOGRAM,
    x: 0,
    y: 6,
    w: cols.xxs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: cols.xxs,
    maxW: cols.xxs,
  },
  {
    i: TOKEN_PRICE_VOL_HISTOGRAM,
    x: 0,
    y: 11,
    w: cols.xxs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: cols.xxs,
    maxW: cols.xxs,
  },
  {
    i: TOKEN_RADIAL_PIE_CHART,
    x: 0,
    y: 16,
    w: cols.xxs,
    h: 4,
    minH: 4,
    maxH: 6,
    minW: cols.xxs,
    maxW: cols.xxs,
  },
  {
    i: TOKEN_WEIGHTS_AREA_CHART,
    x: 0,
    y: 20,
    w: cols.xxs,
    h: 6,
    minW: cols.xxs,
    minH: 6,
    maxH: 10,
    maxW: cols.xxs,
  },
  {
    i: PREMIUMS_LINE_CHART,
    x: 0,
    y: 24,
    w: cols.xxs,
    h: 4,
    minW: cols.xxs,
    minH: 2,
    maxH: 10,
    maxW: cols.xxs,
  },
  {
    i: SPI_EXPOSURES_TABLE_APPID,
    x: 0,
    y: 28,
    w: cols.xxs,
    h: 8,
    minW: cols.xxs,
    minH: 4,
    maxH: 10,
    maxW: cols.xxs,
  },
  {
    i: SPI_EXPOSURES_TABLE_POLICY,
    x: 0,
    y: 30,
    w: cols.xxs,
    h: 8,
    minW: cols.xxs,
    minH: 4,
    maxH: 10,
    maxW: cols.xxs,
  },
  {
    i: COVER_LIMIT_PER_CATEGORY_PIE_CHART,
    x: 0,
    y: 38,
    w: cols.xxs,
    h: 5,
    minH: 4,
    maxH: 6,
    minW: cols.xxs,
    maxW: cols.xxs,
  },
  {
    i: GAUGE_OVERVIEW_TABLE,
    x: 0,
    y: 43,
    w: cols.xxs,
    h: 4,
    minW: cols.xxs,
    minH: 3,
    maxH: 7,
    maxW: cols.xxs,
  },
]

export type ProtocolExposureType = {
  appId: string
  network: string
  balanceUSD: number
  coverLimit: number
  highestPosition: number
  totalExposure: number
  totalLossPayoutAmount: number
  premiumsPerYear: number
  policies: PolicyExposure[]
  positions: any[]
  tier: string
  category: string
  rol: number
}

export type PolicyExposure = {
  policyID: string
  policyHolder: string
  coverLimit: string
  depositsMade: string
  premiumsCharged: string
  exposure: number
  network: string
  product: string
}
