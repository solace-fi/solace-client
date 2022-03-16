import React, { RefObject, useEffect, useMemo } from 'react'
import { Flex, Grid } from '../../../../components/atoms/Layout'
import { SectionTitle } from '../../../../components/atoms/Typography'
import { AboutThesis } from '../molecules/AboutThesis'
import { Text } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'

// export const StakingSection = <StakingSectionFunction />
export function StakingSection({
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
    <Flex col stretch pr={isMobile ? 40 : 150} pl={isMobile ? 40 : 150} justifyCenter ref={ref}>
      <SectionTitle light extrabold isMobile={isMobile}>
        Staking
      </SectionTitle>
      <Flex mt={70}>
        <Grid gap={isMobile ? 50 : 60} columns={isMobile ? 1 : 2}>
          <AboutThesis
            title="No risk of loss"
            text={
              <Text light regular>
                Users earn revenue from the underwriting activity and further $SOLACE distribution, while the{' '}
                <Text extrabold inline light>
                  risk of underwriting falls on the protocol’s owned pool.
                </Text>
              </Text>
            }
          />
          <AboutThesis
            title="Stake and get votes"
            text={
              <>
                Each staked $SOLACE gives you one{' '}
                <Text inline extrabold light>
                  vote in the DAO.
                </Text>
              </>
            }
          />
          <AboutThesis
            title="Long-term bonuses"
            text={
              <>
                Users can{' '}
                <Text extrabold inline>
                  multiply
                </Text>{' '}
                their{' '}
                <Text extrabold inline>
                  rewards
                </Text>{' '}
                (up to 2.5x) and voting rights (up to 4x) as they lock $SOLACE for chosen period.
              </>
            }
          />
          <AboutThesis
            title="Multiple revenue streams"
            text={
              <>
                Staked $SOLACE provides you with exposure to underwriting{' '}
                <Text extrabold inline>
                  rewards
                </Text>
                , underwriting pool{' '}
                <Text extrabold inline>
                  investments
                </Text>
                , plus $SOLACE{' '}
                <Text extrabold inline>
                  emissions
                </Text>
                .
              </>
            }
          />
        </Grid>
      </Flex>
    </Flex>
  )
}
