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
import { truncateValue } from '../../../utils/formatting'
import { rangeFrom0 } from '../../../utils/numeric'
import { useAnalyticsContext } from '../AnalyticsContext'
import { ProtocolExposureType } from '../constants'

enum SortType {
  appID_A,
  appID_D,
  network_A,
  network_D,
  balanceUSD_A,
  balanceUSD_D,
  CL_A,
  CL_D,
  HighestPos_A,
  HighestPos_D,
  exposure_A,
  exposure_D,
  policies_A,
  policies_D,
}

export const SpiExposuresTableByAppId = ({ chosenHeightPx }: { chosenHeightPx: number }) => {
  const { data } = useAnalyticsContext()
  const { protocolExposureData: protocols } = data

  const [selectedSort, setSelectedSort] = useState<SortType>(SortType.balanceUSD_D)
  const [openProtocol, setOpenProtocol] = useState<ProtocolExposureType | undefined>(undefined)

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
        case SortType.appID_A:
          return a.appId.localeCompare(b.appId)
        case SortType.appID_D:
          return b.appId.localeCompare(a.appId)
        case SortType.network_A:
          return a.network.localeCompare(b.network)
        case SortType.network_D:
          return b.network.localeCompare(a.network)
        case SortType.balanceUSD_A:
          return a.balanceUSD - b.balanceUSD
        case SortType.balanceUSD_D:
          return b.balanceUSD - a.balanceUSD
        case SortType.CL_A:
          return a.coverLimit - b.coverLimit
        case SortType.CL_D:
          return b.coverLimit - a.coverLimit
        case SortType.HighestPos_A:
          return a.highestPosition - b.highestPosition
        case SortType.HighestPos_D:
          return b.highestPosition - a.highestPosition
        case SortType.exposure_A:
          return a.totalExposure - b.totalExposure
        case SortType.exposure_D:
          return b.totalExposure - a.totalExposure
        case SortType.policies_A:
          return a.policies.length - b.policies.length
        case SortType.policies_D:
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
            maxDesktopHeight={`${chosenHeightPx - 50}px`}
            maxMobileHeight={`${chosenHeightPx - 50}px`}
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
                      onClick={() =>
                        setSelectedSort(selectedSort == SortType.appID_D ? SortType.appID_A : SortType.appID_D)
                      }
                    >
                      <TextSpan autoAlignVertical>Protocol</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.appID_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.appID_D} autoAlignVertical>
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
                      onClick={() =>
                        setSelectedSort(selectedSort == SortType.network_D ? SortType.network_A : SortType.network_D)
                      }
                    >
                      <TextSpan autoAlignVertical>Network</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.network_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.network_D} autoAlignVertical>
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
                      onClick={() =>
                        setSelectedSort(
                          selectedSort == SortType.balanceUSD_D ? SortType.balanceUSD_A : SortType.balanceUSD_D
                        )
                      }
                    >
                      <TextSpan autoAlignVertical>Total Balance</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.balanceUSD_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.balanceUSD_D} autoAlignVertical>
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
                      onClick={() => setSelectedSort(selectedSort == SortType.CL_D ? SortType.CL_A : SortType.CL_D)}
                    >
                      <TextSpan autoAlignVertical>Cover Limit</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.CL_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.CL_D} autoAlignVertical>
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
                      onClick={() =>
                        setSelectedSort(selectedSort == SortType.exposure_D ? SortType.exposure_A : SortType.exposure_D)
                      }
                    >
                      <TextSpan autoAlignVertical>Exposure</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.exposure_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.exposure_D} autoAlignVertical>
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
                      onClick={() =>
                        setSelectedSort(
                          selectedSort == SortType.HighestPos_D ? SortType.HighestPos_A : SortType.HighestPos_D
                        )
                      }
                    >
                      <TextSpan autoAlignVertical>Highest Position</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.HighestPos_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.HighestPos_D} autoAlignVertical>
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
                      onClick={() =>
                        setSelectedSort(selectedSort == SortType.policies_D ? SortType.policies_A : SortType.policies_D)
                      }
                    >
                      <TextSpan autoAlignVertical>Policies</TextSpan>
                      <GraySquareButton noborder shadow width={60} height={28} radius={8}>
                        <TextSpan info warning={selectedSort == SortType.policies_A} autoAlignVertical>
                          <StyledArrowDropDown size={30} style={{ transform: 'rotate(180deg)' }} />
                        </TextSpan>
                        <TextSpan info warning={selectedSort == SortType.policies_D} autoAlignVertical>
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
                        ${truncateValue(p.totalExposure, 2)}
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
              <Text>Total USD Balance</Text>
              <Text bold>${truncateValue(openProtocol.balanceUSD, 2)}</Text>
            </Flex>
            <Flex between>
              <Text>Total Coverage Limit</Text>
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
            maxDesktopHeight={`${chosenHeightPx - 180}px`}
            maxMobileHeight={`${chosenHeightPx - 180}px`}
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
                      <TextSpan autoAlignVertical>Balance</TextSpan>
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
