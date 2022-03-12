import React, { useEffect, useState } from 'react'
import { Content, Flex, GrayBgDiv, HeroContainer } from '../../components/atoms/Layout'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useGeneral } from '../../context/GeneralManager'
import { SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { Loader } from '../../components/atoms/Loader'
import { Text } from '../../components/atoms/Typography'

export function PortfolioTable({
  portfolio,
  loading,
}: {
  portfolio: SolaceRiskScore | undefined
  loading: boolean
}): JSX.Element {
  const { isDesktop, isMobile } = useWindowDimensions()
  const { appTheme } = useGeneral()
  const [tierColors, setTierColors] = useState<string[]>([])

  useEffect(() => {
    const getGreenToRedColors = (maxTier: number) => {
      if (!portfolio) return

      // rgb settings: since we only want red to green colors, only values r and g will be adjusted
      const luminosityPercentage = appTheme == 'light' ? 0.7 : 0.8
      const rangeMin = appTheme == 'light' ? 60 : 80
      const rangeMax = 255

      // b value appears to represent color intensity in this case, so it is set to rangeMin
      // the lower b is, the stronger the color
      const b = rangeMin
      let r = rangeMax
      let g = b

      const colors = []

      // since we are changing r and g, we are changing two color ranges of equal length,
      // then divide the product by the number of tiers to get the increment
      // we do not need increment if the max tier is 0 or 1
      const increment = maxTier > 1 ? ((rangeMax - rangeMin) * 2) / maxTier : (rangeMax - rangeMin) * 2

      // we start by changing the g value to get the green colors first
      let changingR = false
      for (let i = 0; i < maxTier + 1; i++) {
        // for easier index-to-color access, we are pushing values toward the beginning of the array
        // the lower the index, the greener the color, and the higher the index, the redder the color
        colors.unshift(`rgb(${r * luminosityPercentage}, ${g * luminosityPercentage}, ${b * luminosityPercentage})`)
        if (changingR) {
          r -= increment
        } else {
          // if g goes past the max range, pour that leftover increment into subtracting from r
          if (g + increment > rangeMax) {
            const leftOver = g + increment - rangeMax
            g = rangeMax
            r -= leftOver
            changingR = true
          } else {
            g += increment
          }
          // switch to change r value if we got all the g colors
          if (g == rangeMax) {
            changingR = true
          }
        }
      }
      setTierColors(colors)
    }
    const maxTierProtocol =
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.tier > pn.tier ? cn : pn))
        : undefined
    if (maxTierProtocol) {
      getGreenToRedColors(maxTierProtocol.tier)
    }
  }, [portfolio, appTheme])

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
