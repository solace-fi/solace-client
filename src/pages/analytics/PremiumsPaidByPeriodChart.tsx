import React, { useEffect } from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { useNetwork } from '../../context/NetworkManager'
import { calculateWeeklyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { PremiumsCustomTooltip } from '../../components/organisms/CustomTooltip'

export const PremiumsPaidByPeriodChart = () => {
  const { width, isSmallerMobile } = useWindowDimensions()
  const { activeNetwork } = useNetwork()
  const { data } = useAnalyticsContext()
  const { fetchedPremiums } = data

  const [premiumHistory, setPremiumHistory] = React.useState<any[]>([])

  const xticks =
    premiumHistory.length > 0
      ? calculateWeeklyTicks(premiumHistory[0].timestamp, premiumHistory[premiumHistory.length - 1].timestamp)
      : []

  useEffect(() => {
    if (!fetchedPremiums || !fetchedPremiums?.[activeNetwork.chainId]) {
      setPremiumHistory([])
      return
    }
    const premiumsByChainId = fetchedPremiums?.[activeNetwork.chainId]
    const _premiumHistory = premiumsByChainId.history.map((epoch: any) => {
      return {
        timestamp: epoch.epochStartTimestamp,
        premium: epoch.uweAmount * epoch.uwpValuePerShare * epoch.uwpPerUwe,
      }
    })
    setPremiumHistory(_premiumHistory)
  }, [activeNetwork, fetchedPremiums])

  return (
    <>
      {premiumHistory.length > 0 ? (
        <AreaChart width={isSmallerMobile ? width * 0.95 : width * 0.75} height={300} data={premiumHistory}>
          <defs>
            <linearGradient id={`colorPremium`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={'#13a4e8'} stopOpacity={0.8} />
              <stop offset="95%" stopColor={'#13a4e8'} stopOpacity={0.7} />
            </linearGradient>
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
          <Tooltip content={<PremiumsCustomTooltip valueDecimals={2} chartType={'stackedLine'} color={'#13a4e8'} />} />
          <Area
            type="monotone"
            dataKey={'premium'}
            stackId="1"
            stroke={'#13a4e8'}
            fillOpacity={1}
            fill={`url(#colorPremium)`}
          />
        </AreaChart>
      ) : (
        <Text textAlignCenter t2>
          This chart cannot be viewed at this time
        </Text>
      )}
    </>
  )
}
