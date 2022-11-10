import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Loader } from '../../components/atoms/Loader'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData } from '../../components/atoms/Table'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { Z_TABLE } from '../../constants'
import { useNetwork } from '../../context/NetworkManager'
import { useGaugeController, useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { truncateValue } from '../../utils/formatting'
import { getDateStringWithMonthName } from '../../utils/time'
import { useVoteContext } from '../vote/VoteContext'

export const GaugeOverviewTable = ({ chosenHeightPx, chainId }: { chosenHeightPx: number; chainId: number }) => {
  const { activeNetwork } = useNetwork()
  const { gauges } = useVoteContext()
  const {
    currentGaugesData: activeNetworkCurrentGaugesData,
    insuranceCapacity: activeNetworkInsuranceCapacity,
  } = gauges
  const { getRateOnLineOfGauge } = useGaugeController()
  const { currentGaugesData, insuranceCapacity, loading: gaugesLoading } = useGaugeControllerHelper(
    chainId,
    chainId == activeNetwork.chainId
  )

  const [gaugeTabularData, setGaugeTabularData] = useState<
    { gaugeName: string; coverageUSD: number; rate: BigNumber; startTimestamp: string }[]
  >([])

  const gdToUse = useMemo(
    () => (activeNetwork.chainId == chainId ? activeNetworkCurrentGaugesData : currentGaugesData),
    [chainId, activeNetwork.chainId, activeNetworkCurrentGaugesData, currentGaugesData]
  )

  const icToUse = useMemo(
    () => (activeNetwork.chainId == chainId ? activeNetworkInsuranceCapacity : insuranceCapacity),
    [chainId, activeNetwork.chainId, activeNetworkInsuranceCapacity, insuranceCapacity]
  )

  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const coverages = await Promise.all(
        gdToUse.map(async (gauge) => {
          const rate = await getRateOnLineOfGauge(gauge.gaugeId, chainId)
          const coverageUSD = (parseFloat(formatUnits(gauge.gaugeWeight, 14).split('.')[0]) * icToUse) / 10000
          return { gaugeName: gauge.gaugeName, coverageUSD, rate, startTimestamp: gauge.startTimestamp }
        })
      )
      setGaugeTabularData(coverages)
      setLoading(false)
    }
    init()
  }, [gdToUse, icToUse, getRateOnLineOfGauge, chainId])

  return (
    <>
      {loading || gaugesLoading ? (
        <Loader />
      ) : (
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
      )}
    </>
  )
}
