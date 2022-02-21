import React from 'react'
import { Flex } from '../../../../components/atoms/Layout'
import { SectionTitle } from '../../../../components/atoms/Typography'
import { AboutThesis } from '../molecules/AboutThesis'
import { Text } from '../../../../components/atoms/Typography'

export const StakingSection = (
  <Flex col stretch pr={70}>
    <SectionTitle light extrabold>
      Staking
    </SectionTitle>
    <Flex mt={70}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridGap: '60px',
        }}
      >
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
      </div>
    </Flex>
  </Flex>
)
