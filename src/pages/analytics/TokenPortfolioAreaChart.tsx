import { capitalizeFirstLetter } from '../../utils/formatting'
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts'
import { CustomTooltip } from '../../components/organisms/CustomTooltip'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'

export const TokenPortfolioAreaChart = () => {
  const { width } = useWindowDimensions()
  const { nativeUwpHistoryData: data, acceptedTickers } = useAnalyticsContext()

  function reformatData(json: any): any {
    if (!json || json.length == 0) return []
    const now = Date.now() / 1000
    const start = now - 60 * 60 * 24 * 90 // filter out data points > 3 months ago
    const output = []
    for (let i = 1; i < json.length; ++i) {
      const currData = json[i]
      const timestamp = currData.timestamp
      if (timestamp < start) continue
      const tokens = currData.tokens
      const tokenKeys = Object.keys(tokens)
      const usdArr = tokenKeys.map((key: string) => {
        const balance = tokens[key].balance - 0
        const price = tokens[key].price - 0
        const usd = balance * price
        return usd
      })

      const newRow: any = {
        timestamp: parseInt(currData.timestamp),
      }
      acceptedTickers.forEach((key, i) => {
        newRow[key] = usdArr[i]
      })
      const inf = acceptedTickers.filter((key) => newRow[key] == Infinity).length > 0
      if (!inf) output.push(newRow)
    }
    output.sort((a: any, b: any) => a.timestamp - b.timestamp)
    return output
  }

  const history = useMemo(() => (acceptedTickers.length == 0 ? [] : reformatData(data)), [data, acceptedTickers])
  const xticks =
    history.length > 0 ? calculateMonthlyTicks(history[0].timestamp, history[history.length - 1].timestamp) : []

  const colors = useDistributedColors(acceptedTickers.length)

  return (
    <AreaChart width={width * 0.75} height={300} data={history}>
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
