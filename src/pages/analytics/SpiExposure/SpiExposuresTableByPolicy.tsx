import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GraySquareButton } from '../../../components/atoms/Button'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../../components/atoms/Icon'
import { Flex, Scrollable } from '../../../components/atoms/Layout'
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableData,
  TableFoot,
} from '../../../components/atoms/Table'
import { TextSpan, Text } from '../../../components/atoms/Typography'
import { Z_TABLE } from '../../../constants'
import { useCachedData } from '../../../context/CachedDataManager'
import { truncateValue } from '../../../utils/formatting'
import { PolicyExposure } from '../constants'

export const SpiExposuresTableByPolicy = ({ chosenHeightPx }: { chosenHeightPx: number }) => {
  const { statsCache } = useCachedData()

  const [policies, setPolicies] = useState<any[]>([])

  const [currentPoliciesPage, setCurrentPoliciesPage] = useState<number>(0)
  const numPoliciesPerPage = 10
  const numPagesOfPolicies = useMemo(() => Math.ceil(policies.length / numPoliciesPerPage), [
    numPoliciesPerPage,
    policies,
  ])

  const policiesPaginated = useMemo(
    () => policies.slice(currentPoliciesPage * numPoliciesPerPage, (currentPoliciesPage + 1) * numPoliciesPerPage),
    [currentPoliciesPage, policies]
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
      const policyOf: {
        [key: string]: PolicyExposure
      } = {} // map account -> policy
      const portfolioOf: {
        [key: string]: {
          balanceUSD: number
          highestPositionUSD: number
        }
      } = {} // map account -> portfolio
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
      const _policies: (PolicyExposure & { balanceUSD: number; highestPositionUSD: number })[] = []
      policyholders.forEach((policyholder) => {
        if (!positions.hasOwnProperty(policyholder)) return
        const coveredPositionsOfPolicyholder =
          positions[policyholder].positions_cleaned || positions[policyholder].positions

        const highestPosOfPolicyholder = coveredPositionsOfPolicyholder.reduce(
          (a: any, b: any) => (a.balanceUSD > b.balanceUSD ? a : b),
          {}
        )
        const totalPositionAmount = coveredPositionsOfPolicyholder.reduce((a: any, b: any) => {
          return a + b.balanceUSD
        }, 0)
        const policyExposure = Math.min(
          totalPositionAmount,
          parseFloat(formatUnits(policyOf[policyholder].coverLimit, 18))
        )
        policyOf[policyholder].policyHolder = policyholder
        policyOf[policyholder].exposure = policyExposure
        portfolioOf[policyholder] = {
          balanceUSD: totalPositionAmount,
          highestPositionUSD: highestPosOfPolicyholder?.balanceUSD ?? 0,
        }
        _policies.push({ ...policyOf[policyholder], ...portfolioOf[policyholder] })
      })
      setPolicies(_policies)
    }
    aggregateSpiExposures()
  }, [statsCache])

  return (
    <Flex col gap={10}>
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
        maxDesktopHeight={`${chosenHeightPx}px`}
        maxMobileHeight={`${chosenHeightPx}px`}
        raised={true}
      >
        <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
          <TableHead sticky zIndex={Z_TABLE + 1}>
            <TableRow inheritBg>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Policy</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Origin Network</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>USD Balance</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Cover Limit</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Exposure</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Highest Position</TextSpan>
              </TableHeader>
              <TableHeader style={{ padding: '20px 4px 4px 4px' }}>
                <TextSpan autoAlignVertical>Policyholder</TextSpan>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {policiesPaginated.map((p: any, i: number) => (
              <TableRow raised key={'appId ' + i}>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    {p.policyID}
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
                    ${truncateValue(formatUnits(p.coverLimit, 18), 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    {/* ${truncateValue(p.exposure, 2)} */}$
                    {truncateValue(Math.min(p.balanceUSD, parseFloat(formatUnits(p.coverLimit, 18))), 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical semibold>
                    ${truncateValue(p.highestPositionUSD, 2)}
                  </Text>
                </TableData>
                <TableData style={{ padding: '14px 4px' }}>
                  <Text autoAlignVertical t5s>
                    {p.policyHolder}
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
                      policies.reduce((pv, cv) => (pv += cv.balanceUSD), 0),
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
                      policies.reduce((pv, cv) => (pv += parseFloat(formatUnits(cv.coverLimit, 18))), 0),
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
                      policies.reduce((pv, cv) => (pv += cv.exposure), 0),
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
                      policies.reduce((pv, cv) => (pv += cv.highestPositionUSD), 0),
                      2
                    )}
                  </TextSpan>
                </Flex>
              </TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableFoot>
        </Table>
      </Scrollable>{' '}
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
  )
}
