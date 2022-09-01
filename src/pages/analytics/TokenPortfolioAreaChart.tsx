import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts'
import { CustomTooltip } from '../../components/organisms/CustomTooltip'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'

export const TokenPortfolioAreaChart = () => {
  const { width } = useWindowDimensions()
  const [data, setData] = useState<any[]>([])

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
        usdc: usdArr[0],
        dai: usdArr[1],
        usdt: usdArr[2],
        frax: usdArr[3],
        wbtc: usdArr[4],
        weth: usdArr[5],
        near: usdArr[6],
        aurora: usdArr[7],
        ply: usdArr[8],
        bstn: usdArr[9],
        bbt: usdArr[10],
        tri: usdArr[11],
        vwave: usdArr[12],
        solace: usdArr[13],
      }
      const keys = [
        'usdc',
        'dai',
        'usdt',
        'frax',
        'wbtc',
        'weth',
        'near',
        'aurora',
        'ply',
        'bstn',
        'bbt',
        'tri',
        'vwave',
        'solace',
      ]
      const inf = keys.filter((key) => newRow[key] == Infinity).length > 0
      if (!inf) output.push(newRow)
    }
    output.sort((a: any, b: any) => a.timestamp - b.timestamp)
    return output
  }

  const history = useMemo(() => reformatData(data), [data])
  const xticks =
    history.length > 0 ? calculateMonthlyTicks(history[0].timestamp, history[history.length - 1].timestamp) : []

  const colors = useDistributedColors(14)

  useEffect(() => {
    const getData = async () => {
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      setData(analytics.data['5']) // 5 is gorli chainid
    }
    getData()
  }, [])

  return (
    <AreaChart width={width * 0.75} height={300} data={history}>
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
      <Area type="monotone" dataKey="usdc" stroke={colors[0]} fillOpacity={1} fill="url(#colorUsdc)" stackId="1" />
      <Area type="monotone" dataKey="dai" stroke={colors[1]} fillOpacity={1} fill="url(#colorDai)" stackId="1" />
      <Area type="monotone" dataKey="usdt" stroke={colors[2]} fillOpacity={1} fill="url(#colorUsdt)" stackId="1" />
      <Area type="monotone" dataKey="frax" stroke={colors[3]} fillOpacity={1} fill="url(#colorFrax)" stackId="1" />
      <Area type="monotone" dataKey="wbtc" stroke={colors[5]} fillOpacity={1} fill="url(#colorWbtc)" stackId="1" />
      <Area type="monotone" dataKey="weth" stroke={colors[4]} fillOpacity={1} fill="url(#colorWeth)" stackId="1" />
      <Area type="monotone" dataKey="near" stroke={colors[6]} fillOpacity={1} fill="url(#colorNear)" stackId="1" />
      <Area type="monotone" dataKey="aurora" stroke={colors[7]} fillOpacity={1} fill="url(#colorAurora)" stackId="1" />
      <Area type="monotone" dataKey="ply" stroke={colors[8]} fillOpacity={1} fill="url(#colorPly)" stackId="1" />
      <Area type="monotone" dataKey="bstn" stroke={colors[9]} fillOpacity={1} fill="url(#colorBstn)" stackId="1" />
      <Area type="monotone" dataKey="bbt" stroke={colors[10]} fillOpacity={1} fill="url(#colorBbt)" stackId="1" />
      <Area type="monotone" dataKey="tri" stroke={colors[11]} fillOpacity={1} fill="url(#colorTri)" stackId="1" />
      <Area type="monotone" dataKey="vwave" stroke={colors[12]} fillOpacity={1} fill="url(#colorVwave)" stackId="1" />
      <Area type="monotone" dataKey="solace" stroke={colors[13]} fillOpacity={1} fill="url(#colorSolace)" stackId="1" />
    </AreaChart>
  )
}
