import axios from 'axios'
import { formatUnits } from 'ethers/lib/utils'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { GraySquareButton } from '../../components/atoms/Button'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableFoot, TableHeader, TableRow } from '../../components/atoms/Table'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { processProtocolName } from '../../components/organisms/Dropdown'
import { Z_TABLE } from '../../constants'
import { useScrollPercentage } from '../../hooks/internal/useScrollPercentage'
import { truncateValue } from '../../utils/formatting'
import { mapNumberToLetter } from '../../utils/mapProtocols'

export const SpiExposuresTable = ({ chosenHeight }: { chosenHeight: number }) => {
  const { scrollRef, scrollPercentage } = useScrollPercentage()

  const itemsPerPage = useMemo(() => chosenHeight / 45, [chosenHeight])
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [selectedSort, setSelectedSort] = useState<string>('balanceUSD_D')
  const [protocols, setProtocols] = useState<
    {
      appId: string
      network: string
      balanceUSD: number
      coverLimit: number
      highestPosition: number
      totalExposure: number
      totalLossPayoutAmount: number
      premiumsPerYear: number
      policies: {
        policyID: string
        policyHolder: string
        coverLimit: string
        depositsMade: string
        premiumsCharged: string
        exposure: number
      }[]
      positions: any[]
    }[]
  >([])

  const handlePage = useCallback((number: number) => {
    setCurrentPage(number)
  }, [])

  const modifiedSort = useCallback(
    (a, b) => {
      switch (selectedSort) {
        case 'appID_A':
          return a.appId.localeCompare(b.appId)
        case 'appID_D':
          return b.appId.localeCompare(a.appId)
        case 'network_A':
          return a.network.localeCompare(b.network)
        case 'network_D':
          return b.network.localeCompare(a.network)
        case 'balanceUSD_A':
          return a.balanceUSD - b.balanceUSD
        case 'balanceUSD_D':
          return b.balanceUSD - a.balanceUSD
        case 'CL_A':
          return a.coverLimit - b.coverLimit
        case 'CL_D':
          return b.coverLimit - a.coverLimit
        case 'HighestPos_A':
          return a.highestPosition - b.highestPosition
        case 'HighestPos_D':
          return b.highestPosition - a.highestPosition
        case 'exposure_A':
          return a.totalExposure - b.totalExposure
        case 'exposure_D':
          return b.totalExposure - a.totalExposure
        case 'policies_A':
          return a.policies.length - b.policies.length
        case 'policies_D':
        default:
          return b.policies.length - a.policies.length
      }
    },
    [selectedSort]
  )

  useEffect(() => {
    if (scrollPercentage > 70 && protocols.length > itemsPerPage * currentPage) {
      handlePage(currentPage + 1)
    } else if (scrollPercentage < 20 && currentPage > 1) {
      handlePage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPercentage])

  useEffect(() => {
    const aggregateSpiExposures = async () => {
      const statsCache = await axios.get('https://stats-cache.solace.fi/analytics-stats.json')
      if (
        !statsCache.data ||
        !statsCache.data.spi ||
        Object.keys(statsCache.data.spi).length == 0 ||
        (!statsCache.data.positions && !statsCache.data.positions_cleaned) ||
        !statsCache.data.series
      )
        return
      const positions = statsCache.data.positions || statsCache.data.positions_cleaned
      const series = statsCache.data.series
      const policyOf: {
        [key: string]: {
          policyID: string
          policyHolder: string
          coverLimit: string
          depositsMade: string
          premiumsCharged: string
          exposure: number
        }
      } = {} // map account -> policy
      statsCache.data.spi.ethereum_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'ethereum'
        policyOf[policy.policyholder] = policy
      })
      statsCache.data.spi.aurora_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'aurora'
        policyOf[policy.policyholder] = policy
      })
      statsCache.data.spi.polygon_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'polygon'
        policyOf[policy.policyholder] = policy
      })
      statsCache.data.spi.fantom_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'fantom'
        policyOf[policy.policyholder] = policy
      })
      const policyholders: string[] = Object.keys(policyOf)

      const protocols: {
        appId: string
        network: string
        balanceUSD: number
        coverLimit: number
        highestPosition: number
        totalExposure: number
        totalLossPayoutAmount: number
        premiumsPerYear: number
        policies: {
          policyID: string
          policyHolder: string
          coverLimit: string
          depositsMade: string
          premiumsCharged: string
          exposure: number
        }[]
        positions: any[]
      }[] = []
      policyholders.forEach((policyholder: string) => {
        if (!positions.hasOwnProperty(policyholder)) {
          // console.log(`uncached policyholder ${policyholder}`)
          return
        }
        const coveredPositionsOfPolicyholder =
          positions[policyholder].positions_cleaned || positions[policyholder].positions
        const highestPosOfPolicyholder = coveredPositionsOfPolicyholder.reduce(
          (a: any, b: any) => (a.balanceUSD > b.balanceUSD ? a : b),
          {}
        )
        const policyExposure = Math.min(
          highestPosOfPolicyholder.balanceUSD,
          parseFloat(formatUnits(policyOf[policyholder].coverLimit, 18))
        )
        policyOf[policyholder].exposure = policyExposure
        const policy = policyOf[policyholder]
        coveredPositionsOfPolicyholder.forEach((p: any) => {
          const foundProtocols = protocols.filter(
            (protocol: any) => protocol.appId == p.appId && protocol.network == p.network
          )
          let protocol: any = {}
          if (foundProtocols.length > 1) console.log('warning in exposures')
          if (foundProtocols.length == 0) {
            // new protocol found. create new entry
            protocol = {
              appId: p.appId,
              network: p.network,
              balanceUSD: 0,
              coverLimit: 0,
              highestPosition: 0,
              totalExposure: 0,
              totalLossPayoutAmount: 0,
              premiumsPerYear: 0,
              policies: [],
              positions: [],
            }
            protocols.push(protocol)
            // map to series
            const foundSeries = series.data.protocolMap.filter((s: any) => s.appId == p.appId)
            if (foundSeries.length > 1) console.log('protocols series uhh')
            if (foundSeries.length == 0) {
              // unknown protocol
              protocol.tier = 'F'
              protocol.category = 'unknown'
              protocol.rol = series.data.rateCard[0].rol
            } else {
              const tier = foundSeries[0].tier
              protocol.tier = mapNumberToLetter(tier)
              protocol.category = foundSeries[0].category
              protocol.rol = series.data.rateCard[tier].rol
            }
          } else protocol = foundProtocols[0]

          const balanceUSD = parseFloat(p.balanceUSD)
          const coverLimit = parseFloat(formatUnits(policy.coverLimit, 18))
          const totalLossPayoutAmount = Math.min(coverLimit, balanceUSD)
          const premiumsPerYear = totalLossPayoutAmount * protocol.rol
          protocol.balanceUSD += balanceUSD
          protocol.coverLimit += coverLimit
          protocol.highestPosition = Math.max(protocol.highestPosition, highestPosOfPolicyholder.balanceUSD)
          protocol.totalExposure += policyExposure
          protocol.totalLossPayoutAmount += totalLossPayoutAmount
          protocol.premiumsPerYear += premiumsPerYear
          p.premiumsPerYear = premiumsPerYear
          protocol.policies.push(policy)
          protocol.positions.push(p)
        })
      })
      setProtocols(protocols)
    }
    aggregateSpiExposures()
  }, [])

  return (
    <Scrollable
      style={{ padding: '0 10px 0 10px' }}
      maxDesktopHeight={`${chosenHeight}px`}
      maxMobileHeight={`${chosenHeight}px`}
      raised={true}
      ref={scrollRef}
    >
      <Table canHover textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky zIndex={Z_TABLE + 1}>
          <TableRow inheritBg>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'appID_D' ? 'appID_A' : 'appID_D')}
              >
                <TextSpan autoAlignVertical>Protocol</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'appID_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'appID_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'network_D' ? 'network_A' : 'network_D')}
              >
                <TextSpan autoAlignVertical>Network</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'network_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'network_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'balanceUSD_D' ? 'balanceUSD_A' : 'balanceUSD_D')}
              >
                <TextSpan autoAlignVertical>USD Balance</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'balanceUSD_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'balanceUSD_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'CL_D' ? 'CL_A' : 'CL_D')}
              >
                <TextSpan autoAlignVertical>Cover Limit</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'CL_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'CL_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'HighestPos_D' ? 'HighestPos_A' : 'HighestPos_D')}
              >
                <TextSpan autoAlignVertical>Highest Position</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'HighestPos_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'HighestPos_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'exposure_D' ? 'exposure_A' : 'exposure_D')}
              >
                <TextSpan autoAlignVertical>Total Exposure</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'exposure_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'exposure_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex
                col
                justifyCenter
                itemsCenter
                onClick={() => setSelectedSort(selectedSort == 'policies_D' ? 'policies_A' : 'policies_D')}
              >
                <TextSpan autoAlignVertical>Policies</TextSpan>
                <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                  <TextSpan info warning={selectedSort == 'policies_A'} autoAlignVertical>
                    <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                  </TextSpan>
                  <TextSpan info warning={selectedSort == 'policies_D'} autoAlignVertical>
                    <StyledArrowDropDown size={30} />
                  </TextSpan>
                </GraySquareButton>
              </Flex>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {protocols
            .sort((a, b) => modifiedSort(a, b))
            .slice(0, itemsPerPage * currentPage)
            .map((p: any, i: number) => (
              <TableRow key={i} raised style={{ cursor: 'pointer' }}>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    {processProtocolName(p.appId)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    {p.network}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    ${truncateValue(p.balanceUSD, 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    ${truncateValue(p.coverLimit, 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    ${truncateValue(p.highestPosition, 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    ${truncateValue(p.totalExposure, 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    {p.policies.length}
                  </Text>
                </TableData>
              </TableRow>
            ))}
        </TableBody>
        <TableFoot sticky zIndex={Z_TABLE + 1}>
          <TableRow inheritBg>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>Total:</TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}></TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>
                  $
                  {truncateValue(
                    protocols.reduce((pv, cv) => (pv += cv.balanceUSD), 0),
                    2
                  )}
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>
                  {' '}
                  $
                  {truncateValue(
                    protocols.reduce((pv, cv) => (pv += cv.coverLimit), 0),
                    2
                  )}
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>
                  {' '}
                  $
                  {truncateValue(
                    protocols.reduce((pv, cv) => (pv += cv.highestPosition), 0),
                    2
                  )}
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>
                  {' '}
                  $
                  {truncateValue(
                    protocols.reduce((pv, cv) => (pv += cv.totalExposure), 0),
                    2
                  )}
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '12px 4px' }}>
              <Flex justifyCenter>
                <TextSpan autoAlignVertical>
                  {truncateValue(
                    protocols.reduce((pv, cv) => (pv += cv.policies.length), 0),
                    2
                  )}
                </TextSpan>
              </Flex>
            </TableHeader>
          </TableRow>
        </TableFoot>
      </Table>
    </Scrollable>
  )
}
