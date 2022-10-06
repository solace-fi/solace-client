import React, { useMemo } from 'react'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts'
import { UwpCustomTooltip } from '../../components/organisms/CustomTooltip'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'
import { Text } from '../../components/atoms/Typography'
import { Loader } from '../../components/atoms/Loader'

export const TokenPortfolioAreaChart = () => {
  const { width, isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  const { canSeePortfolioAreaChart } = intrface
  const { priceHistory30D, portfolioHistogramTickers } = data
  const xticks = useMemo(
    () =>
      priceHistory30D.length > 0
        ? calculateMonthlyTicks(priceHistory30D[0].timestamp, priceHistory30D[priceHistory30D.length - 1].timestamp)
        : [],
    [priceHistory30D]
  )

  const colors = useDistributedColors(portfolioHistogramTickers.length)

  return (
    <>
      {canSeePortfolioAreaChart ? (
        <AreaChart width={isMobile ? width : width * 0.75} height={300} data={priceHistory30D}>
          <defs>
            {portfolioHistogramTickers.map((key, i) => (
              <linearGradient id={`color${capitalizeFirstLetter(key)}`} x1="0" y1="0" x2="0" y2="1" key={i}>
                <stop offset="5%" stopColor={colors[i]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="timestamp"
            scale="time"
            type="number"
            domain={['auto', 'auto']}
            ticks={xticks}
            tickFormatter={xtickLabelFormatter}
            stroke="#c0c2c3"
            dy={5}
          />
          <YAxis
            tickFormatter={formatCurrency({ decimals: 0 })}
            domain={[0, 'auto']}
            allowDataOverflow={false}
            stroke="#c0c2c3"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<UwpCustomTooltip valueDecimals={2} chartType={'stackedLine'} colors={colors} />} />
          {portfolioHistogramTickers.map((key, i) => {
            return (
              <Area
                key={i}
                type="monotone"
                dataKey={key}
                stroke={colors[i]}
                fillOpacity={1}
                fill={`url(#color${capitalizeFirstLetter(key)})`}
                stackId="1"
              />
            )
          })}
        </AreaChart>
      ) : canSeePortfolioAreaChart == false ? (
        <Text textAlignCenter t2>
          This chart cannot be viewed at this time
        </Text>
      ) : (
        <Loader />
      )}
    </>
  )
}
