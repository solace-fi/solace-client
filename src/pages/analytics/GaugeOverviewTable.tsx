import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData } from '../../components/atoms/Table'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { Z_TABLE } from '../../constants'
import { useGaugeController } from '../../hooks/gauge/useGaugeController'
import { truncateValue } from '../../utils/formatting'
import { getDateStringWithMonthName } from '../../utils/time'
import { useVoteContext } from '../vote/VoteContext'

export const GaugeOverviewTable = ({ chosenHeightPx }: { chosenHeightPx: number }) => {
  const { gauges } = useVoteContext()
  const { currentGaugesData, insuranceCapacity } = gauges
  const { getRateOnLineOfGauge } = useGaugeController()

  const [gaugeTabularData, setGaugeTabularData] = useState<
    { gaugeName: string; coverageUSD: number; rate: BigNumber; startTimestamp: string }[]
  >([])

  useEffect(() => {
    const init = async () => {
      const coverages = await Promise.all(
        currentGaugesData.map(async (gauge) => {
          const rate = await getRateOnLineOfGauge(gauge.gaugeId)
          const coverageUSD = (parseFloat(formatUnits(gauge.gaugeWeight, 14).split('.')[0]) * insuranceCapacity) / 10000
          return { gaugeName: gauge.gaugeName, coverageUSD, rate, startTimestamp: gauge.startTimestamp }
        })
      )
      setGaugeTabularData(coverages)
    }
    init()
  }, [currentGaugesData, insuranceCapacity, getRateOnLineOfGauge])

  return (
    <Scrollable
      style={{ padding: '0 10px 0 10px' }}
      maxDesktopHeight={`${chosenHeightPx}px`}
      maxMobileHeight={`${chosenHeightPx}px`}
      raised={true}
    >
      <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky zIndex={Z_TABLE + 1}>
          <TableRow inheritBg>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>Gauge</TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>Coverage</TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>Start Date</TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>ROL</TextSpan>
              </Flex>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {gaugeTabularData.length > 0 &&
            gaugeTabularData.map((gauge, i) => (
              <TableRow key={i}>
                <TableData style={{ padding: '14px 0px' }}>
                  <Text autoAlignVertical semibold>
                    {gauge.gaugeName}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 0px' }}>
                  <Text autoAlignVertical>${truncateValue(gauge.coverageUSD, 2)}</Text>
                </TableData>
                <TableData style={{ padding: '14px 0px' }}>
                  <Text autoAlignVertical t5s>
                    {getDateStringWithMonthName(new Date(Number(gauge.startTimestamp) * 1000))}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 0px' }}>
                  <Text autoAlignVertical>{parseFloat(formatUnits(gauge.rate)) * 100}%</Text>
                </TableData>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Scrollable>
  )
}
