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
  SPI_EXPOSURES_TABLE,
} = AnalyticsChart

export const breakpointsObj = { lg: BKPT_5, md: BKPT_4, sm: BKPT_2, xs: BKPT_1, xxs: 0 }
export const gridCols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export const layoutLG = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizeable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizeable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizeable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 5, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 8, h: 5, minH: 4, maxH: 10, minW: 3, maxW: 12 },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: 12, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 12 },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: 12, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 12 },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 9, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 12 },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 12 },
  { i: SPI_EXPOSURES_TABLE, x: 4, y: 24, w: 9, h: 8, minW: 2, minH: 4, maxH: 10, maxW: 12 },
]

export const layoutMD = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizeable: false },
  { i: UWP_SIZE_STAT, x: 2, y: 0, w: 2, h: 1, isResizeable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 4, y: 0, w: 2, h: 1, isResizeable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 0, y: 1, w: 4, h: 4, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 10 },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: 10, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 10 },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: 10, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 10 },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 20, w: 7, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 10 },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 3, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 10 },
  { i: SPI_EXPOSURES_TABLE, x: 4, y: 24, w: 7, h: 8, minW: 2, minH: 4, maxH: 10, maxW: 10 },
]

export const layoutSM = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 2, h: 1, isResizeable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 2, h: 1, isResizeable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 2, h: 1, isResizeable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 4, h: 3, minH: 3, maxH: 6, minW: 3, maxW: 6 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 6 },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: 6, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 6 },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: 6, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 6 },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 3, y: 16, w: 3, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 6 },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 6, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 6 },
  { i: SPI_EXPOSURES_TABLE, x: 0, y: 28, w: 6, h: 8, minW: 2, minH: 4, maxH: 10, maxW: 6 },
]

export const layoutXS = [
  { i: PREMIUMS_STAT, x: 0, y: 0, w: 1, h: 1, isResizeable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 1, w: 1, h: 1, isResizeable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 0, y: 2, w: 1, h: 1, isResizeable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 1, y: 1, w: 3, h: 3, minH: 3, maxH: 6, minW: 3, maxW: 4 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 4, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 4 },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: 4, h: 8, minH: 8, maxH: 10, minW: 4, maxW: 4 },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: 4, h: 8, minH: 8, maxH: 10, minW: 4, maxW: 4 },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 4, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 4 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 0, y: 20, w: 4, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 4 },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 4, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 4 },
  { i: SPI_EXPOSURES_TABLE, x: 0, y: 28, w: 4, h: 8, minW: 2, minH: 4, maxH: 10, maxW: 4 },
]

export const layoutXXS = [
  { i: PREMIUMS_STAT, x: 0, y: 1, w: 1, h: 1, isResizeable: false },
  { i: UWP_SIZE_STAT, x: 0, y: 0, w: 2, h: 1, isResizeable: false },
  { i: LEVERAGE_FACTOR_STAT, x: 1, y: 1, w: 1, h: 1, isResizeable: false },
  { i: TOKEN_COMPOSITION_TABLE, x: 2, y: 1, w: 3, h: 5, minH: 3, maxH: 6, minW: 2, maxW: 2 },
  { i: PORTFOLIO_AREA_CHART, x: 4, y: 1, w: 2, h: 7, minH: 7, maxH: 10, minW: 2, maxW: 2 },
  { i: PORTFOLIO_VOL_HISTOGRAM, x: 0, y: 6, w: 2, h: 8, minH: 8, maxH: 10, minW: 2, maxW: 2 },
  { i: TOKEN_PRICE_VOL_HISTOGRAM, x: 0, y: 11, w: 2, h: 8, minH: 8, maxH: 10, minW: 2, maxW: 2 },
  { i: TOKEN_RADIAL_PIE_CHART, x: 0, y: 16, w: 2, h: 4, minH: 4, maxH: 6, minW: 2, maxW: 2 },
  { i: TOKEN_WEIGHTS_AREA_CHART, x: 0, y: 20, w: 2, h: 6, minW: 2, minH: 6, maxH: 10, maxW: 2 },
  { i: PREMIUMS_LINE_CHART, x: 0, y: 24, w: 2, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 2 },
  { i: SPI_EXPOSURES_TABLE, x: 0, y: 28, w: 2, h: 8, minW: 2, minH: 4, maxH: 10, maxW: 2 },
]
