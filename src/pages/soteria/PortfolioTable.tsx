import React from 'react'
import { Content, Flex, GrayBgDiv, HeroContainer } from '../../components/atoms/Layout'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { Loader } from '../../components/atoms/Loader'
import { Text } from '../../components/atoms/Typography'
import { useTierColors } from '../../hooks/internal/useTierColors'

export function PortfolioTable({
  portfolio,
  loading,
}: {
  portfolio: SolaceRiskScore | undefined
  loading: boolean
}): JSX.Element {
  const { isDesktop, isMobile } = useWindowDimensions()

  const tierColors = useTierColors(portfolio ? portfolio.protocols.map((p) => p.tier) : undefined)

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  return (
    <>
      {loading && (
        <Content>
          <Loader />
        </Content>
      )}
      {!loading && !portfolio && (
        <HeroContainer>
          <Text t1 textAlignCenter>
            Unable to retrieve your positions.
          </Text>
        </HeroContainer>
      )}
      {!loading && portfolio && portfolio.protocols.length == 0 && (
        <HeroContainer>
          <Text t1 textAlignCenter>
            No DeFi positions found in this account.
          </Text>
        </HeroContainer>
      )}
      {isDesktop && !loading && portfolio && portfolio.protocols.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Protocol</TableHeader>
              <TableHeader>Network</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Risk Level</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolio.protocols.map((d: SolaceRiskProtocol, i) => (
              <TableRow key={i}>
                <TableData>{capitalizeFirstLetter(d.appId)}</TableData>
                <TableData>{capitalizeFirstLetter(d.network)}</TableData>
                <TableData>{d.category}</TableData>
                <TableData>{d.balanceUSD}</TableData>
                {tierColors.length > 0 && (
                  <TableData style={{ color: getColorByTier(d.tier) }}>{d.tier == 0 ? 'Unrated' : d.tier}</TableData>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {isMobile && !loading && portfolio && portfolio.protocols.length > 0 && (
        <Flex column gap={30}>
          {portfolio.protocols.map((row, i) => (
            <GrayBgDiv
              key={i}
              style={{
                borderRadius: '10px',
                padding: '14px 24px',
              }}
            >
              <Flex gap={30} between itemsCenter>
                <Flex col gap={8.5}>
                  <div>{capitalizeFirstLetter(row.appId)}</div>
                </Flex>
                <Flex col gap={8.5}>
                  <div>{capitalizeFirstLetter(row.network)}</div>
                </Flex>
                <Flex
                  col
                  gap={8.5}
                  style={{
                    textAlign: 'right',
                  }}
                >
                  <div>{row.category}</div>
                  <div>{row.balanceUSD}</div>
                  {tierColors.length > 0 && (
                    <div style={{ color: getColorByTier(row.tier) }}>{row.tier == 0 ? 'Unrated' : row.tier}</div>
                  )}{' '}
                </Flex>
              </Flex>
            </GrayBgDiv>
          ))}
        </Flex>
      )}
    </>
  )
}
