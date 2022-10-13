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
} = AnalyticsChart

export const breakpointsObj = { lg: BKPT_5, md: BKPT_4, sm: BKPT_2, xs: BKPT_1, xxs: 0 }
export const gridCols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export const layoutLG = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 5, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 8, h: 5, minH: 4, maxH: 10, minW: 3, maxW: gridCols.lg },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: gridCols.lg, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.lg },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: gridCols.lg, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.lg },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 9, h: 4, minW: 3, minH: 4, maxH: 10, maxW: gridCols.lg },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: gridCols.lg },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 4, y: 24, w: 9, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.lg },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 32, w: 9, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.lg },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 28, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
]

export const layoutMD = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 4, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: gridCols.md },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: gridCols.md, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.md },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: gridCols.md, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.md },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 7, h: 4, minW: 3, minH: 4, maxH: 10, maxW: gridCols.md },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: gridCols.md },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 4, y: 24, w: 7, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.md },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 31, w: 7, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.md },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 28, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
]

export const layoutSM = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 2, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 2, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 4, h: 3, minH: 3, maxH: 6, minW: 3, maxW: gridCols.sm },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: gridCols.sm, h: 4, minH: 4, maxH: 10, minW: 3, maxW: gridCols.sm },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: gridCols.sm, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.sm },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: gridCols.sm, h: 5, minH: 4, maxH: 10, minW: 4, maxW: gridCols.sm },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 16, w: 3, h: 4, minW: 3, minH: 4, maxH: 10, maxW: gridCols.sm },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: gridCols.sm, h: 4, minW: 2, minH: 2, maxH: 10, maxW: gridCols.sm },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 0, y: 28, w: gridCols.sm, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.sm },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 34, w: gridCols.sm, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.sm },
  { i: COVER_LIMIT_PER_CATEGORY_PIE_CHART, x: 0, y: 42, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
]

export const layoutXS = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 1, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 1, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 1, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 1, y: 1, w: 3, h: 3, minH: 3, maxH: 6, minW: 3, maxW: gridCols.xs },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: gridCols.xs, h: 4, minH: 4, maxH: 10, minW: 3, maxW: gridCols.xs },
  {
    i: PORTFOLIO_VOL_HISTOGRAM,
    x: 0,
    y: 6,
    w: gridCols.xs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: gridCols.xs,
    maxW: gridCols.xs,
  },
  {
    i: TOKEN_PRICE_VOL_HISTOGRAM,
    x: 0,
    y: 11,
    w: gridCols.xs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: gridCols.xs,
    maxW: gridCols.xs,
  },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: gridCols.xs, h: 4, minH: 4, maxH: 6, minW: 3, maxW: gridCols.xs },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 0, y: 20, w: gridCols.xs, h: 4, minW: 3, minH: 4, maxH: 10, maxW: gridCols.xs },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: gridCols.xs, h: 4, minW: 2, minH: 2, maxH: 10, maxW: gridCols.xs },
  { i: SPI_EXPOSURES_TABLE_APPID, x: 0, y: 28, w: gridCols.xs, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.xs },
  { i: SPI_EXPOSURES_TABLE_POLICY, x: 0, y: 32, w: gridCols.xs, h: 8, minW: 2, minH: 4, maxH: 10, maxW: gridCols.xs },
  {
    i: COVER_LIMIT_PER_CATEGORY_PIE_CHART,
    x: 0,
    y: 40,
    w: gridCols.xs,
    h: 4,
    minH: 4,
    maxH: 6,
    minW: 3,
    maxW: gridCols.xs,
  },
]

export const layoutXXS = [
  { i: PREMIUMS_STAT, x: 0, y: 1, w: 1, h: 1, isResizable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 0, w: gridCols.xxs, h: 1, isResizable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 1, y: 1, w: 1, h: 1, isResizable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 3, h: 5, minH: 3, maxH: 6, minW: gridCols.xxs, maxW: gridCols.xxs },
  {
    i: PORTFOLIO_AREA_CHART,
    x: 4,
    y: 1,
    w: gridCols.xxs,
    h: 7,
    minH: 7,
    maxH: 10,
    minW: gridCols.xxs,
    maxW: gridCols.xxs,
  },
  {
    i: PORTFOLIO_VOL_HISTOGRAM,
    x: 0,
    y: 6,
    w: gridCols.xxs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: gridCols.xxs,
    maxW: gridCols.xxs,
  },
  {
    i: TOKEN_PRICE_VOL_HISTOGRAM,
    x: 0,
    y: 11,
    w: gridCols.xxs,
    h: 8,
    minH: 8,
    maxH: 10,
    minW: gridCols.xxs,
    maxW: gridCols.xxs,
  },
  {
    i: TOKEN_RADIAL_PIE_CHART,
    x: 0,
    y: 16,
    w: gridCols.xxs,
    h: 4,
    minH: 4,
    maxH: 6,
    minW: gridCols.xxs,
    maxW: gridCols.xxs,
  },
  {
    i: TOKEN_WEIGHTS_AREA_CHART,
    x: 0,
    y: 20,
    w: gridCols.xxs,
    h: 6,
    minW: gridCols.xxs,
    minH: 6,
    maxH: 10,
    maxW: gridCols.xxs,
  },
  {
    i: PREMIUMS_LINE_CHART,
    x: 0,
    y: 24,
    w: gridCols.xxs,
    h: 4,
    minW: gridCols.xxs,
    minH: 2,
    maxH: 10,
    maxW: gridCols.xxs,
  },
  {
    i: SPI_EXPOSURES_TABLE_APPID,
    x: 0,
    y: 28,
    w: gridCols.xxs,
    h: 8,
    minW: gridCols.xxs,
    minH: 4,
    maxH: 10,
    maxW: gridCols.xxs,
  },
  {
    i: SPI_EXPOSURES_TABLE_POLICY,
    x: 0,
    y: 30,
    w: gridCols.xxs,
    h: 8,
    minW: gridCols.xxs,
    minH: 4,
    maxH: 10,
    maxW: gridCols.xxs,
  },
  {
    i: COVER_LIMIT_PER_CATEGORY_PIE_CHART,
    x: 0,
    y: 16,
    w: gridCols.xxs,
    h: 38,
    minH: 4,
    maxH: 6,
    minW: gridCols.xxs,
    maxW: gridCols.xxs,
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
