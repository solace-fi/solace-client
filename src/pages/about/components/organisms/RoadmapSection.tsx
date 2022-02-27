import React from 'react'
import { Flex, Grid } from '../../../../components/atoms/Layout'
import { SectionTitle } from '../../../../components/atoms/Typography'
import { AboutThesis } from '../molecules/AboutThesis'
import { Text } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'

export const RoadmapSection = <RoadmapSectionFunction />
function RoadmapSectionFunction(): JSX.Element {
  const { isMobile } = useWindowDimensions()
  // export const RoadmapSection = (
  return (
    <Flex col stretch pr={70} justifyCenter>
      <SectionTitle light extrabold fontSize={isMobile ? 36 : 48} lineHeight={isMobile ? 43.88 : 82} ml={80}>
        Roadmap
      </SectionTitle>
      {/* <Flex mt={70}>
        <Grid gap={isMobile ? 50 : 60} columns={isMobile ? 1 : 2} ml={50}>
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
      </Flex> */}
    </Flex>
  )
}
