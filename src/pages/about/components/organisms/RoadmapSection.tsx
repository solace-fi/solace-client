import React from 'react'
import { Flex, Grid } from '../../../../components/atoms/Layout'
import { SectionTitle } from '../../../../components/atoms/Typography'
import { Text } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import styled from 'styled-components'

const ProgressBarContainer = styled.div`
  grid-column: span 4 / span 4;
  height: 3px;
  background-color: ${({ theme }) => theme.typography.lightNeutral};
  border-radius: 999px;
`
const ProgressBarContent = styled.div<{ progress: number }>`
  height: 3px;
  background-color: ${({ theme }) => theme.typography.lightText};
  border-radius: 999px;
  width: ${(props) => props.progress}%;
`

function ProgressBar() {
  return (
    <>
      {/* progress bar container */}
      <ProgressBarContainer>
        {/* progress bar */}
        <ProgressBarContent progress={50} />
      </ProgressBarContainer>
    </>
  )
}

// export const RoadmapSection = <RoadmapSectionFunction />
export function RoadmapSection(): JSX.Element {
  const { isMobile } = useWindowDimensions()
  // export const RoadmapSection = (
  return (
    <Flex col stretch pr={70} justifyCenter>
      <SectionTitle light extrabold fontSize={isMobile ? 36 : 48} lineHeight={isMobile ? 43.88 : 82}>
        Roadmap
      </SectionTitle>
      <Grid columns={4} gap={10} mt={60}>
        <Text big2 mont bold>
          2021
        </Text>
        <Text big2 mont bold>
          2022
        </Text>
        <ProgressBar />
        <div>
          <Text t1s mont bold>
            Q4
          </Text>
          <ul
            style={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
            }}
          >
            <li>$SOLACE token launch </li>
            <li>Protocol Owned Underwriting Pool </li>
            <li>Protocol coverage products</li>
          </ul>
        </div>
        <div>
          <Text t1s mont bold>
            Q1
          </Text>
          <ul
            style={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
            }}
          >
            <li>DAO-2-DAO coverage launch</li>
            <li>Solace Wallet Coverage launch</li>
            <li>Cross-chain Deployments (Aurora, Polygon)</li>
            <li>Staking V2 w/locking and voting rights</li>
          </ul>
        </div>
        <div>
          <Text t1s mont bold>
            Q2
          </Text>
          <ul
            style={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
            }}
          >
            <li>Cross-chain Deployments (BNB, FTM, AVAX, etc.)</li>
            <li>Decentralization of Claims System</li>
            <li>Cross-chain balancing of staking/locking APY%</li>
            <li>Dynamic inflation-control model</li>
          </ul>
        </div>
        <div>
          <Text t1s mont bold>
            Q3
          </Text>
          <ul
            style={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
            }}
          >
            <li>Non-EVM deployments</li>
            <li>Asset Protection Tools beyond DeFi</li>
            <li>Transition to Community-run DAO</li>
            <li>Solace Market - open cover product platform</li>
          </ul>
        </div>
      </Grid>
    </Flex>
  )
}
