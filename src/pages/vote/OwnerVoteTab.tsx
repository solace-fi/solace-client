import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { OwnerVoteGauge } from './organisms/OwnerVoteGauge'
import { useUwpLockVoting } from '../../hooks/lock/useUwpLockVoting'
import { useVoteContext } from './VoteContext'

export const OwnerVoteTab = () => {
  const { gauges, voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { gaugesData } = gauges
  const { votesData } = voteOwner

  const { voteMultiple, removeVoteMultiple } = useUwpLockVoting()
  const { account } = useWeb3React()

  const areAllGaugesActive_Voter = useMemo(() => {
    votesData.voteAllocation.filter((g) => !g.gaugeActive).length === 0
  }, [votesData.voteAllocation])

  return (
    <>
      <Flex>
        <Text semibold t2>
          My Gauge Votes
        </Text>
      </Flex>
      <Flex col itemsCenter gap={15}>
        <ShadowDiv>
          <Flex gap={12} p={10}>
            <Flex col itemsCenter width={126}>
              <Text techygradient t6s>
                My Total Points
              </Text>
              <Text techygradient big3>
                239
              </Text>
            </Flex>
            <Flex col itemsCenter width={126}>
              <Text t6s>My Used Points</Text>
              <Text big3>239</Text>
            </Flex>
          </Flex>
        </ShadowDiv>
        <Accordion isOpen={votesData.voteAllocation.length > 0} thinScrollbar>
          <Flex col gap={10} p={10}>
            {votesData.voteAllocation.map((voteData, i) => (
              <OwnerVoteGauge key={i} index={i} />
            ))}
          </Flex>
        </Accordion>
        {isVotingOpen ? (
          <>
            <Button onClick={() => addEmptyVote(true)}>+ Add Gauge Vote</Button>
            <Button
              techygradient
              secondary
              noborder
              widthP={100}
              onClick={() => {
                if (!account || !isAddress(account)) return
                voteMultiple(
                  account,
                  gaugesData.map((item) => item.gaugeId),
                  gaugesData.map((item) => item.gaugeWeight)
                )
              }}
            >
              Set Votes
            </Button>
            <Button
              error
              widthP={100}
              onClick={() => {
                if (!account || !isAddress(account)) return
                removeVoteMultiple(
                  account,
                  gaugesData.map((item) => item.gaugeId)
                )
              }}
            >
              Remove all votes
            </Button>
          </>
        ) : (
          <Text>Voting is closed</Text>
        )}
      </Flex>
    </>
  )
}
