import { formatUnits } from 'ethers/lib/utils'
import React, { useState, useCallback, useEffect, useMemo, Fragment } from 'react'
import { Button, GraySquareButton } from '../../../components/atoms/Button'
import {
  StyledArrowDropDown,
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
} from '../../../components/atoms/Icon'
import { Flex, Scrollable } from '../../../components/atoms/Layout'
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableFoot,
  TableHeader,
  TableRow,
} from '../../../components/atoms/Table'
import { Text, TextSpan } from '../../../components/atoms/Typography'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Z_TABLE } from '../../../constants'
import { useCachedData } from '../../../context/CachedDataManager'
import { truncateValue } from '../../../utils/formatting'
import { mapNumberToLetter } from '../../../utils/mapProtocols'
import { rangeFrom0 } from '../../../utils/numeric'
import { PolicyExposure, ProtocolExposureType } from '../constants'

export const SpiExposuresTableByAppId = ({ chosenHeight }: { chosenHeight: number }) => {
  const { statsCache } = useCachedData()

  const [selectedSort, setSelectedSort] = useState<string>('balanceUSD_D')
  const [openProtocol, setOpenProtocol] = useState<ProtocolExposureType | undefined>(undefined)

  const [protocols, setProtocols] = useState<ProtocolExposureType[]>([])

  const [currentProtocolsPage, setCurrentProtocolsPage] = useState<number>(0)
  const numProtocolsPerPage = 10
  const numPagesOfProtocols = useMemo(() => Math.ceil(protocols.length / numProtocolsPerPage), [
    numProtocolsPerPage,
    protocols.length,
  ])

  const [currentPoliciesPage, setCurrentPoliciesPage] = useState<number>(0)
  const numPoliciesPerPage = 10
  const numPagesOfPolicies = useMemo(
    () => (openProtocol ? Math.ceil(openProtocol.policies.length / numPoliciesPerPage) : 0),
    [numPoliciesPerPage, openProtocol]
  )

  const modifiedSortProtocols = useCallback(
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

  const protocolsPaginated = useMemo(
    () =>
      protocols
        .sort((a, b) => modifiedSortProtocols(a, b))
        .slice(currentProtocolsPage * numProtocolsPerPage, (currentProtocolsPage + 1) * numProtocolsPerPage),
    [currentProtocolsPage, protocols, modifiedSortProtocols]
  )

  const policiesPaginated = useMemo(
    () =>
      openProtocol
        ? openProtocol.policies.slice(
            currentPoliciesPage * numPoliciesPerPage,
            (currentPoliciesPage + 1) * numPoliciesPerPage
          )
        : [],
    [currentPoliciesPage, openProtocol]
  )

  const positionsPaginated = useMemo(
    () =>
      openProtocol
        ? openProtocol.positions.slice(
            currentPoliciesPage * numPoliciesPerPage,
            (currentPoliciesPage + 1) * numPoliciesPerPage
          )
        : [],
    [currentPoliciesPage, openProtocol]
  )

  const handleCurrentProtocolsPageChange = useCallback(
    (dest: 'next' | 'prev') => {
      if (dest == 'prev') {
        setCurrentProtocolsPage(currentProtocolsPage - 1 < 0 ? numPagesOfProtocols - 1 : currentProtocolsPage - 1)
      } else {
        setCurrentProtocolsPage(currentProtocolsPage + 1 > numPagesOfProtocols - 1 ? 0 : currentProtocolsPage + 1)
      }
    },
    [currentProtocolsPage, numPagesOfProtocols]
  )

  const handleCurrentPoliciesPageChange = useCallback(
    (dest: 'next' | 'prev') => {
      if (dest == 'prev') {
        setCurrentPoliciesPage(currentPoliciesPage - 1 < 0 ? numPagesOfPolicies - 1 : currentPoliciesPage - 1)
      } else {
        setCurrentPoliciesPage(currentPoliciesPage + 1 > numPagesOfPolicies - 1 ? 0 : currentPoliciesPage + 1)
      }
    },
    [currentPoliciesPage, numPagesOfPolicies]
  )

  useEffect(() => {
    const aggregateSpiExposures = async () => {
      if (
        !statsCache ||
        !statsCache.spi ||
        Object.keys(statsCache.spi).length == 0 ||
        (!statsCache.positions && !statsCache.positions_cleaned) ||
        !statsCache.series
      )
        return
      const positions = statsCache.positions || statsCache.positions_cleaned
      const series = statsCache.series
      const policyOf: {
        [key: string]: PolicyExposure
      } = {} // map account -> policy
      statsCache.spi.ethereum_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'ethereum'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.aurora_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'aurora'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.polygon_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'polygon'
        policyOf[policy.policyholder] = policy
      })
      statsCache.spi.fantom_v3.policies.forEach((policy: any) => {
        policy.product = 'SPI V3'
        policy.network = 'fantom'
        policyOf[policy.policyholder] = policy
      })
      const policyholders: string[] = Object.keys(policyOf)

      const protocols: ProtocolExposureType[] = []
      policyholders.forEach((policyholder: string) => {
        if (!positions.hasOwnProperty(policyholder)) {
          return
        }
        const coveredPositionsOfPolicyholder =
          positions[policyholder].positions_cleaned || positions[policyholder].positions
        const highestPosOfPolicyholder = coveredPositionsOfPolicyholder.reduce(
          (a: any, b: any) => (a.balanceUSD > b.balanceUSD ? a : b),
          {}
        )
        const policyExposure = Math.min(
          highestPosOfPolicyholder?.balanceUSD ?? 0,
          parseFloat(formatUnits(policyOf[policyholder].coverLimit, 18))
        )
        policyOf[policyholder].policyHolder = policyholder
        policyOf[policyholder].exposure = policyExposure
        const policy = policyOf[policyholder]
        coveredPositionsOfPolicyholder.forEach((coveredPosition: any) => {
          const foundProtocols = protocols.filter(
            (protocol: any) => protocol.appId == coveredPosition.appId && protocol.network == coveredPosition.network
          )
          let protocol: any = {}
          if (foundProtocols.length > 1) console.log('warning in exposures')
          if (foundProtocols.length == 0) {
            // new protocol found. create new entry
            protocol = {
              appId: coveredPosition.appId,
              network: coveredPosition.network,
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
            const foundSeries = series.data.protocolMap.filter((s: any) => s.appId == coveredPosition.appId)
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

          const balanceUSD = parseFloat(coveredPosition.balanceUSD)
          const coverLimit = parseFloat(formatUnits(policy.coverLimit, 18))
          const totalLossPayoutAmount = Math.min(coverLimit, balanceUSD)
          const premiumsPerYear = totalLossPayoutAmount * protocol.rol
          protocol.balanceUSD += balanceUSD
          protocol.coverLimit += coverLimit
          protocol.highestPosition = Math.max(protocol.highestPosition, highestPosOfPolicyholder?.balanceUSD ?? 0)
          protocol.totalExposure += Math.min(balanceUSD, coverLimit)
          protocol.totalLossPayoutAmount += totalLossPayoutAmount
          protocol.premiumsPerYear += premiumsPerYear
          coveredPosition.premiumsPerYear = premiumsPerYear
          protocol.policies.push(policy)
          protocol.positions.push(coveredPosition)
        })
      })
      setProtocols(protocols)
    }
    aggregateSpiExposures()
  }, [statsCache])

  return (
    <>
      {!openProtocol ? (
        <Flex col gap={10}>
          <Flex justifyCenter>
            {numPagesOfProtocols > 1 && (
              <Flex pb={20} justifyCenter>
                <Flex itemsCenter gap={5}>
                  <GraySquareButton onClick={() => handleCurrentProtocolsPageChange('prev')}>
                    <StyledArrowIosBackOutline height={18} />
                  </GraySquareButton>
                  {numPagesOfProtocols > 1 && (
                    <Text t4>
                      Page {currentProtocolsPage + 1}/{numPagesOfProtocols}
                    </Text>
                  )}
                  <GraySquareButton onClick={() => handleCurrentProtocolsPageChange('next')}>
                    <StyledArrowIosForwardOutline height={18} />
                  </GraySquareButton>
                </Flex>
              </Flex>
            )}
          </Flex>
          <Scrollable
            style={{ padding: '0 10px 0 10px' }}
            maxDesktopHeight={`${chosenHeight - 50}px`}
            maxMobileHeight={`${chosenHeight - 50}px`}
            raised={true}
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
                {protocolsPaginated.map((p: ProtocolExposureType, i: number) => (
                  <TableRow raised key={'appId ' + i} style={{ cursor: 'pointer' }} onClick={() => setOpenProtocol(p)}>
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
                        ${truncateValue(Math.min(p.balanceUSD, p.coverLimit), 2)}
                      </Text>
                    </TableData>
                    <TableData style={{ padding: '14px 4px' }}>
                      <Text autoAlignVertical semibold>
                        ${truncateValue(p.highestPosition, 2)}
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
                          protocols.reduce((pv, cv) => (pv += cv.totalExposure), 0),
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
          <Flex justifyCenter>
            {numPagesOfProtocols > 1 && (
              <Flex pb={20} justifyCenter>
                <Flex itemsCenter gap={5}>
                  <GraySquareButton onClick={() => handleCurrentProtocolsPageChange('prev')}>
                    <StyledArrowIosBackOutline height={18} />
                  </GraySquareButton>
                  {numPagesOfProtocols > 1 && (
                    <Text t4>
                      Page {currentProtocolsPage + 1}/{numPagesOfProtocols}
                    </Text>
                  )}
                  <GraySquareButton onClick={() => handleCurrentProtocolsPageChange('next')}>
                    <StyledArrowIosForwardOutline height={18} />
                  </GraySquareButton>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex col gap={10}>
          <Flex mt={20} around>
            <Text autoAlign bold>
              Policies covering {processProtocolName(openProtocol.appId)} ({openProtocol.network})
            </Text>
            <Button onClick={() => setOpenProtocol(undefined)}>Return</Button>
          </Flex>
          <Flex col>
            <Flex between>
              <Text>USD Balance</Text>
              <Text bold>${truncateValue(openProtocol.balanceUSD, 2)}</Text>
            </Flex>
            <Flex between>
              <Text>Coverage Limit</Text>
              <Text bold>${truncateValue(openProtocol.coverLimit, 2)}</Text>
            </Flex>
            <Flex between>
              <Text>Total Exposure</Text>
              <Text bold>${truncateValue(openProtocol.totalExposure, 2)}</Text>
            </Flex>
          </Flex>
          <Flex justifyCenter>
            {numPagesOfPolicies > 1 && (
              <Flex pb={20} justifyCenter>
                <Flex itemsCenter gap={5}>
                  <GraySquareButton onClick={() => handleCurrentPoliciesPageChange('prev')}>
                    <StyledArrowIosBackOutline height={18} />
                  </GraySquareButton>
                  {numPagesOfPolicies > 1 && (
                    <Text t4>
                      Page {currentPoliciesPage + 1}/{numPagesOfPolicies}
                    </Text>
                  )}
                  <GraySquareButton onClick={() => handleCurrentPoliciesPageChange('next')}>
                    <StyledArrowIosForwardOutline height={18} />
                  </GraySquareButton>
                </Flex>
              </Flex>
            )}
          </Flex>
          <Scrollable
            style={{ padding: '0 10px 0 10px' }}
            maxDesktopHeight={`${chosenHeight - 180}px`}
            maxMobileHeight={`${chosenHeight - 180}px`}
            raised={true}
          >
            <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
              <TableHead sticky zIndex={Z_TABLE + 1}>
                <TableRow inheritBg>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>Policy ID</TextSpan>
                    </Flex>
                  </TableHeader>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>Network Origin</TextSpan>
                    </Flex>
                  </TableHeader>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>USD Balance</TextSpan>
                    </Flex>
                  </TableHeader>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>Cover Limit</TextSpan>
                    </Flex>
                  </TableHeader>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>Total Exposure</TextSpan>
                    </Flex>
                  </TableHeader>
                  <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                    <Flex col justifyCenter itemsCenter>
                      <TextSpan autoAlignVertical>Policyholder</TextSpan>
                    </Flex>
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rangeFrom0(policiesPaginated.length).map((j: number) => {
                  const policy = policiesPaginated[j]
                  const position = positionsPaginated[j]
                  return (
                    <TableRow key={'policy ' + j}>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical semibold>
                          {policiesPaginated[j].policyID}
                        </Text>
                      </TableData>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical semibold>
                          {policy.network}
                        </Text>
                      </TableData>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical semibold>
                          ${truncateValue(position.balanceUSD, 2)}
                        </Text>
                      </TableData>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical semibold>
                          ${truncateValue(formatUnits(policy.coverLimit, 18), 2)}
                        </Text>
                      </TableData>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical semibold>
                          ${' '}
                          {truncateValue(
                            Math.min(position.balanceUSD, parseFloat(formatUnits(policy.coverLimit, 18))),
                            2
                          )}
                        </Text>
                      </TableData>
                      <TableData style={{ padding: '14px 4px' }}>
                        <Text autoAlignVertical t5s>
                          {policy.policyHolder}
                        </Text>
                      </TableData>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Scrollable>
          <Flex justifyCenter>
            {numPagesOfPolicies > 1 && (
              <Flex pb={20} justifyCenter>
                <Flex itemsCenter gap={5}>
                  <GraySquareButton onClick={() => handleCurrentPoliciesPageChange('prev')}>
                    <StyledArrowIosBackOutline height={18} />
                  </GraySquareButton>
                  {numPagesOfPolicies > 1 && (
                    <Text t4>
                      Page {currentPoliciesPage + 1}/{numPagesOfPolicies}
                    </Text>
                  )}
                  <GraySquareButton onClick={() => handleCurrentPoliciesPageChange('next')}>
                    <StyledArrowIosForwardOutline height={18} />
                  </GraySquareButton>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </>
  )
}
