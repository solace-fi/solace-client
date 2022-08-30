import React, { useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalytics } from '../../hooks/api/useAnalytics'
import { Line, AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { range } from '../../utils/numeric'
import { Text } from '../../components/atoms/Typography'
import { Card } from '../../components/atoms/Card'
import { useDistributedColors } from '../../hooks/internal/useDistributedColors'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

export function formatTimestamp(timestamp: number) {
  const d = new Date(timestamp * 1000)
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()} ${leftPad(d.getUTCHours(), 2, '0')}:${leftPad(
    d.getUTCMinutes(),
    2,
    '0'
  )}:${leftPad(d.getUTCSeconds(), 2, '0')}`
}

export function formatNumber(params: any) {
  function f(n: string) {
    if (typeof n == 'number') n = `${n}`
    let str = `${parseInt(n).toLocaleString()}`
    if (!params || !params.decimals || params.decimals <= 0) return str
    const i = n.indexOf('.')
    let str2 = i == -1 ? '' : n.substring(i + 1)
    str2 = rightPad(str2.substring(0, params.decimals), params.decimals, '0')
    str = `${str}.${str2}`
    return str
  }
  return f
}

export function tooltipFormatterNumber(params: any) {
  const f2 = formatNumber(params)
  function f(props: any) {
    let num = f2(props)
    if (params.prefix) num = `${params.prefix}${num}`
    return num
  }
  return f
}

export function CustomTooltip(props: any) {
  const { appTheme } = useGeneral()
  const { active, payload, label, valuePrefix, valueDecimals, chartType } = props
  const [payload2, setPayload2] = useState<any[] | undefined>(undefined)

  const colors = useDistributedColors(14)

  useEffect(() => {
    if (!active || !payload || !payload.length) {
      setPayload2(undefined)
      return
    }
    const _payload2 = JSON.parse(JSON.stringify(payload))
    if (chartType && chartType == 'stackedLine') _payload2.reverse()
    let maxLengthName = 0
    let maxLengthValue = 0
    const formatter = tooltipFormatterNumber({ decimals: valueDecimals, prefix: valuePrefix })
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].nameText = _payload2[i].name
      if (_payload2[i].nameText.length > maxLengthName) maxLengthName = _payload2[i].nameText.length
      _payload2[i].valueText = formatter(_payload2[i].value)
      if (_payload2[i].valueText.length > maxLengthValue) maxLengthValue = _payload2[i].valueText.length
    }
    for (let i = 0; i < _payload2.length; ++i) {
      _payload2[i].rowText = `${rightPad(_payload2[i].nameText, maxLengthName)}  ${leftPad(
        _payload2[i].valueText,
        maxLengthValue
      )}`
    }
    setPayload2(_payload2)
  }, [payload, active, chartType, valueDecimals, valuePrefix])

  return (
    <>
      {payload2 ? (
        <Card>
          <Flex col gap={5}>
            <Text semibold>{formatTimestamp(label)}</Text>
            <Flex col gap={2}>
              {payload2.map((item: any, key: any) => {
                return (
                  <Text t5s key={key} style={{ color: colors[payload2.length - key - 1] }}>
                    {item.rowText}
                  </Text>
                )
              })}
            </Flex>
          </Flex>
        </Card>
      ) : null}
    </>
  )
}

export function leftPad(s: any, l: number, f = ' ') {
  let s2 = `${s}`
  while (s2.length < l) s2 = `${f}${s2}`
  return s2
}

export function rightPad(s: any, l: number, f = ' ') {
  let s2 = `${s}`
  while (s2.length < l) s2 = `${s2}${f}`
  return s2
}

export function xtickLabelFormatter(str: any) {
  const d = new Date(str * 1000)
  const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthMap[d.getUTCMonth()]
  const day = leftPad(d.getUTCDate(), 2, '0')
  const res = `${month} ${day}`
  return res
}

export function calculateWeeklyTicks(start: number, stop: number) {
  const one_week = 60 * 60 * 24 * 7
  const three_days = 60 * 60 * 24 * 3
  const rstop = stop
  const rstart = Math.ceil(start / one_week) * one_week + three_days
  let xticks = range(rstart, rstop, one_week)
  xticks.push(start)
  xticks.push(stop)
  xticks = Array.from(new Set(xticks)).sort()
  return xticks
}

export function calculateMonthlyTicks(start: number, stop: number) {
  let xticks = [start, stop]
  const startDate = new Date(start * 1000)
  const stopDate = new Date(stop * 1000)
  const d = new Date(0)
  d.setUTCFullYear(startDate.getUTCFullYear())
  d.setUTCMonth(startDate.getUTCMonth() + 1)
  while (d.getTime() < stopDate.getTime()) {
    // push
    xticks.push(d.getTime() / 1000)
    // roll over year
    if (d.getUTCMonth() == 11) {
      d.setUTCFullYear(d.getUTCFullYear() + 1)
      d.setUTCMonth(0)
    }
    // next month same year
    else {
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
  }
  xticks = Array.from(new Set(xticks)).sort()
  return xticks
}

export function formatCurrency(params: any) {
  function f(n: any) {
    if (typeof n == 'number') n = `${n}`
    let str = `\$${parseInt(n).toLocaleString()}`
    if (!params || !params.decimals || params.decimals <= 0) return str
    const i = n.indexOf('.')
    if (i == -1) return str
    let str2 = n.substring(i + 1)
    str2 = rightPad(str2.substring(0, params.decimals), params.decimals, '0')
    str = `${str}.${str2}`
    return str
  }
  return f
}

export default function Analytics(): JSX.Element {
  const { data: analyticsData } = useAnalytics()
  const { width } = useWindowDimensions()

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

  const history = useMemo(() => reformatData(analyticsData), [analyticsData])
  const xticks =
    history.length > 0 ? calculateMonthlyTicks(history[0].timestamp, history[history.length - 1].timestamp) : []

  const colors = useDistributedColors(14)

  return (
    <Flex col>
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
        <Area
          type="monotone"
          dataKey="aurora"
          stroke={colors[7]}
          fillOpacity={1}
          fill="url(#colorAurora)"
          stackId="1"
        />
        <Area type="monotone" dataKey="ply" stroke={colors[8]} fillOpacity={1} fill="url(#colorPly)" stackId="1" />
        <Area type="monotone" dataKey="bstn" stroke={colors[9]} fillOpacity={1} fill="url(#colorBstn)" stackId="1" />
        <Area type="monotone" dataKey="bbt" stroke={colors[10]} fillOpacity={1} fill="url(#colorBbt)" stackId="1" />
        <Area type="monotone" dataKey="tri" stroke={colors[11]} fillOpacity={1} fill="url(#colorTri)" stackId="1" />
        <Area type="monotone" dataKey="vwave" stroke={colors[12]} fillOpacity={1} fill="url(#colorVwave)" stackId="1" />
        <Area
          type="monotone"
          dataKey="solace"
          stroke={colors[13]}
          fillOpacity={1}
          fill="url(#colorSolace)"
          stackId="1"
        />
      </AreaChart>
    </Flex>
  )
}
