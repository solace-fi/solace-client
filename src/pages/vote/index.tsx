import React, { useState } from 'react'

import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { TileCard } from '../../components/molecules/TileCard'
import { ModalCell } from '../../components/atoms/Modal'
import { GaugePieChart } from './GaugePieChart'
import { StatsBox } from './StatsBox'
import { OwnerVoteTab } from './OwnerVoteTab'
import { DelegatorVoteTab } from './DelegatorVoteTab'
import VoteManager from './VoteContext'

function Vote(): JSX.Element {
  return (
    <VoteManager>
      <VoteContent />
    </VoteManager>
  )
}

export const VoteContent = () => {
  const [ownerTab, setOwnerTab] = useState(true)

  const { isMobile } = useWindowDimensions()

  return (
    <div style={{ margin: 'auto' }}>
      <Flex col={isMobile} row={!isMobile}>
        <Flex col widthP={!isMobile ? 60 : undefined} p={10} gap={20}>
          <GaugePieChart />
          <StatsBox />
        </Flex>
        <Flex col widthP={!isMobile ? 40 : undefined} p={10}>
          <TileCard gap={15}>
            <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => setOwnerTab(true)}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: ownerTab ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t3 bold info={ownerTab}>
                  Vote as Myself
                </Text>
              </ModalCell>
              <VerticalSeparator />
              <ModalCell
                pt={5}
                pb={10}
                pl={0}
                pr={0}
                onClick={() => setOwnerTab(false)}
                jc={'center'}
                style={{ cursor: 'pointer', backgroundColor: !ownerTab ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
              >
                <Text t3 bold info={!ownerTab}>
                  Vote as a Delegate
                </Text>
              </ModalCell>
            </div>
            {ownerTab ? <OwnerVoteTab /> : <DelegatorVoteTab />}
          </TileCard>
        </Flex>
      </Flex>
    </div>
  )
}

export default Vote
