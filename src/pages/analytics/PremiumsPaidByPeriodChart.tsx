import React, { useEffect } from 'react'
import { useNetwork } from '../../context/NetworkManager'
import { calculateWeeklyTicks, xtickLabelFormatter } from '../../utils/chart'
import { formatCurrency } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'
import { Text } from '../../components/atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'

export const PremiumsPaidByPeriodChart = ({
  chosenWidth,
  chosenHeightPx,
}: {
  chosenWidth: number
  chosenHeightPx: number
}) => {
  const { appTheme } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { data } = useAnalyticsContext()
  const { fetchedPremiums } = data

  // const [premiumHistory, setPremiumHistory] = React.useState<any[]>([])

  // const xticks =
  //   premiumHistory.length > 0
  //     ? calculateWeeklyTicks(premiumHistory[0].timestamp, premiumHistory[premiumHistory.length - 1].timestamp)
  //     : []

  const fetchVega = (dataIn: any, theme: 'light' | 'dark') => {
    vegaEmbed('#vis_ppbp', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Premiums Paid By Period', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
      },
      background: 'transparent',
      width: 'container',
      height: chosenHeightPx,
      autosize: {
        type: 'fit',
        contains: 'padding',
        resize: true,
      },
      data: { values: dataIn },
      mark: { type: 'line', tooltip: true },
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          type: 'temporal',
          field: 'timestamp',
          title: 'Date',
          axis: { format: '%Y-%m-%d', title: '', grid: false, titleColor: theme == 'light' ? 'black' : 'white' },
        },
        y: {
          field: 'premium',
          type: 'quantitative',
          axis: { titleColor: theme == 'light' ? 'black' : 'white' },
        },
      },
    })
  }

  useEffect(() => {
    if (!fetchedPremiums || !fetchedPremiums?.[activeNetwork.chainId]) return
    const premiumsByChainId = fetchedPremiums?.[activeNetwork.chainId]
    const _premiumHistory = premiumsByChainId.history.map((epoch: any) => {
      return {
        timestamp: epoch.epochStartTimestamp * 1000,
        premium: epoch.uweAmount * epoch.uwpValuePerShare * epoch.uwpPerUwe,
      }
    })
    fetchVega(_premiumHistory, appTheme)
  }, [activeNetwork, fetchedPremiums, appTheme, chosenHeightPx, chosenWidth])

  return (
    <Flex>
      <Flex id="vis_ppbp" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
