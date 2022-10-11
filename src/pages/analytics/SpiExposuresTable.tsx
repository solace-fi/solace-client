import axios from 'axios'
import { formatUnits } from 'ethers/lib/utils'
import React, { useState, useCallback, useEffect } from 'react'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableFoot, TableHeader, TableRow } from '../../components/atoms/Table'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { processProtocolName } from '../../components/organisms/Dropdown'
import { Z_TABLE } from '../../constants'
import { truncateValue } from '../../utils/formatting'
import { mapNumberToLetter } from '../../utils/mapProtocols'

export const SpiExposuresTable = ({ chosenHeight }: { chosenHeight: number }) => {
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
          return a.cl - b.cl
        case 'CL_D':
          return b.cl - a.cl
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
    >
      <Table canHover textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky zIndex={Z_TABLE + 1}>
          <TableRow inheritBg>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'appID_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('appID_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Protocol</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'appID_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('appID_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'network_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('network_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Network</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'network_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('network_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'balanceUSD_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('balanceUSD_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>USD Balance</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'balanceUSD_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('balanceUSD_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'CL_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('CL_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Cover Limit</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'CL_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('CL_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'HighestPos_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('HighestPos_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Highest Position</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'HighestPos_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('HighestPos_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'exposure_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('exposure_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Exposure</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'exposure_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('exposure_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
            <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
              <Flex justifyCenter>
                <TextSpan
                  info
                  warning={selectedSort == 'policies_A'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('policies_A')}
                >
                  <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                </TextSpan>
                <TextSpan autoAlignVertical>Policies</TextSpan>
                <TextSpan
                  info
                  warning={selectedSort == 'policies_D'}
                  autoAlignVertical
                  onClick={() => setSelectedSort('policies_D')}
                >
                  <StyledArrowDropDown size={30} />
                </TextSpan>
              </Flex>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {protocols
            .sort((a, b) => modifiedSort(a, b))
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
        </TableFoot>
      </Table>
    </Scrollable>
  )
}
