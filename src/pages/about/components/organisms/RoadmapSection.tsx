import React, { RefObject, useEffect, useMemo } from 'react'
import { Flex, Grid } from '../../../../components/atoms/Layout'
import { SectionTitle } from '../../../../components/atoms/Typography'
import { Text } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
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

function Quarter({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Text t1s mont bold light>
      {children}
    </Text>
  )
}

function RoadmapList({ children }: { children: React.ReactNode[] }): JSX.Element {
  return (
    <ul
      style={{
        display: 'flex',
        gap: '20px',
        flexDirection: 'column',
      }}
    >
      {children.map((child, index) => (
        <li key={index}>
          <Text light>{child}</Text>
        </li>
      ))}
    </ul>
  )
}

// export const RoadmapSection = <RoadmapSectionFunction />
export function RoadmapSection({
  sectionRef: ref,
  getScrollerForThisRef,
  isVisible,
}: {
  sectionRef?: React.Ref<HTMLDivElement>
  getScrollerForThisRef?: (ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>) => () => void
  isVisible?: boolean
}): JSX.Element {
  const { isMobile } = useWindowDimensions()
  const scroller = useMemo(
    () => (ref && getScrollerForThisRef ? getScrollerForThisRef(ref) : () => console.log('no ref')),
    [ref, getScrollerForThisRef]
  )
  useEffect(() => {
    if (isVisible) scroller()
  }, [isVisible, scroller, ref])

  return (
    <Flex
      col
      stretch
      pr={isMobile ? 40 : 150}
      pl={isMobile ? 40 : 150}
      justifyCenter
      ref={ref}
      style={{
        display: isMobile ? 'none' : 'flex',
      }}
    >
      <SectionTitle light extrabold isMobile={isMobile}>
        Roadmap
      </SectionTitle>
      <Grid columns={4} gap={10} mt={60}>
        <Text big2 mont bold light>
          2021
        </Text>
        <Text big2 mont bold light>
          2022
        </Text>
        <ProgressBar />
        <div>
          <Quarter>Q4</Quarter>
          <RoadmapList>
            <li>$SOLACE token launch </li>
            <li>Protocol Owned Underwriting Pool </li>
            <li>Protocol coverage products</li>
          </RoadmapList>
        </div>
        <div>
          <Quarter>Q1</Quarter>
          <RoadmapList>
            <li>DAO-2-DAO coverage launch</li>
            <li>Solace Wallet Coverage launch</li>
            <li>Cross-chain Deployments (Aurora, Polygon)</li>
            <li>Staking V2 w/locking and voting rights</li>
          </RoadmapList>
        </div>
        <div>
          <Quarter>Q2</Quarter>
          <RoadmapList>
            <li>Cross-chain Deployments (BNB, FTM, AVAX, etc.)</li>
            <li>Decentralization of Claims System</li>
            <li>Cross-chain balancing of staking/locking APY%</li>
            <li>Dynamic inflation-control model</li>
          </RoadmapList>
        </div>
        <div>
          <Quarter>Q3</Quarter>
          <RoadmapList>
            <li>Non-EVM deployments</li>
            <li>Asset Protection Tools beyond DeFi</li>
            <li>Transition to Community-run DAO</li>
            <li>Solace Market - open cover product platform</li>
          </RoadmapList>
        </div>
      </Grid>
    </Flex>
  )
}
