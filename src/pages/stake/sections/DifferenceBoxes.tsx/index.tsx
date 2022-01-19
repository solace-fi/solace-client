import React from 'react'
import Flex from '../../atoms/Flex'
import RaisedBox from '../../atoms/RaisedBox'
import ShadowDiv from '../../atoms/ShadowDiv'
import { Text } from '../../../../components/atoms/Typography'
import { Button } from '../../../../components/atoms/Button'
import styled from 'styled-components'
import { Tab } from '../../types/Tab'
import { StakingVersion } from '../../types/Version'

/*
          style={{
            width: '378px',
            // py = 40px, px = 24px
            padding: '40px 24px',
          }} */
const StyledRaisedBox = styled(RaisedBox)<{
  theme: any
}>`
  width: 378px;
  padding: 40px 24px;
  // techy-gradient
  background-image: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.typography.techyGradientA},
    ${({ theme }) => theme.typography.techyGradientB}
  );
`

export default function DifferenceBoxes({
  setStakingVersion,
}: {
  setStakingVersion: (tab: StakingVersion) => void
}): JSX.Element {
  return (
    <Flex center gap={100}>
      <ShadowDiv>
        <RaisedBox
          style={{
            width: '378px',
            // py = 40px, px = 24px
            padding: '40px 24px',
          }}
        >
          <Flex center column gap={40}>
            <Text t1 extrabold>
              Staking V1
            </Text>
            <Flex column gap={20} center>
              <Text t2>Benefit 1</Text>
              <Text t2>Benefit 2</Text>
              <Text t2 lineThrough>
                Benefit 3
              </Text>
              <Text t2 lineThrough>
                Benefit 4
              </Text>
              <Text t2 lineThrough>
                Benefit 5
              </Text>
              <Text t5s textAlignCenter style={{ fontWeight: 400, margin: '10px 55px 0px 55px' }}>
                Some additional info about some stuff and other stuff for users to understand.
              </Text>
            </Flex>
            <Button
              pl={23}
              pr={23}
              pt={10}
              pb={10}
              techygradient
              secondary
              noborder
              onClick={() => setStakingVersion(StakingVersion.v1)}
            >
              <Text bold light t4>
                Migrate to V2
              </Text>
            </Button>
          </Flex>
        </RaisedBox>
      </ShadowDiv>
      <ShadowDiv>
        <StyledRaisedBox>
          <Flex center column gap={40}>
            <Text t1 extrabold light>
              Staking V2
            </Text>
            <Flex column gap={20} center>
              <Text t2 light>
                Benefit 1
              </Text>
              <Text t2 light>
                Benefit 2
              </Text>
              <Text t2 light>
                Benefit 3
              </Text>
              <Text t2 light>
                Benefit 4
              </Text>
              <Text t2 light>
                Benefit 5
              </Text>
              <Text t5s light textAlignCenter style={{ fontWeight: 400, margin: '10px 55px 0px 55px' }}>
                Some additional info about some stuff and other stuff for users to understand.
              </Text>
            </Flex>
            <Button pl={23} pr={23} noborder secondary light onClick={() => setStakingVersion(StakingVersion.v2)}>
              <Text bold dark t4>
                Start Using V2
              </Text>
            </Button>
          </Flex>
        </StyledRaisedBox>
      </ShadowDiv>
    </Flex>
  )
}
