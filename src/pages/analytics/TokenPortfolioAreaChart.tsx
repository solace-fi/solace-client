import React from 'react'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts'
import { CustomTooltip } from '../../components/organisms/CustomTooltip'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'

export const TokenPortfolioAreaChart = () => {
  const { width } = useWindowDimensions()
  const { priceHistory30D, acceptedTickers } = useAnalyticsContext()
  const xticks =
    priceHistory30D.length > 0
      ? calculateMonthlyTicks(priceHistory30D[0].timestamp, priceHistory30D[priceHistory30D.length - 1].timestamp)
      : []

  const colors = useDistributedColors(acceptedTickers.length)

  return (
    <AreaChart width={width * 0.75} height={300} data={priceHistory30D}>
      <defs>
        {acceptedTickers.map((key, i) => (
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
      <Tooltip content={<CustomTooltip valueDecimals={2} chartType={'stackedLine'} />} />
      {acceptedTickers.map((key, i) => {
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
  )
}
