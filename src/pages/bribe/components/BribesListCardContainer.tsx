import React from 'react'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { truncateValue } from '../../../utils/formatting'
import { CardContainer } from '../../../components/atoms/Card'
import { Button } from '../../../components/atoms/Button'
import { TileCard } from '../../../components/molecules/TileCard'
import { useBribeContext } from '../BribeContext'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../../vote/VoteContext'
import { BigNumber } from '@solace-fi/sdk-nightly'

export const BribeCardContainer = ({
  isBribeChaser,
  handleSelectBribe,
  searchTerm,
}: {
  isBribeChaser: boolean
  handleSelectBribe: (id: BigNumber) => void
  searchTerm: string
}): JSX.Element => {
  const { voteOwner } = useVoteContext()
  const { votesData } = voteOwner
  const { bribes } = useBribeContext()
  const { gaugeBribeInfo, bribeTokens, userVotes } = bribes

  return (
    <CardContainer cardsPerRow={1}>
      {gaugeBribeInfo
        .filter((gauge) => {
          if (searchTerm == '') return gauge
          return (
            gauge.gaugeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gauge.bribes
              .map((bribe) =>
                bribeTokens
                  .find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
                  ?.symbol.toLowerCase()
              )
              .every((symbol) => symbol?.includes(searchTerm.toLowerCase())) ||
            gauge.bribes
              .map((bribe) =>
                bribeTokens
                  .find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
                  ?.name.toLowerCase()
              )
              .every((name) => name?.includes(searchTerm.toLowerCase()))
          )
        })
        .filter((gauge) => {
          if (isBribeChaser) return gauge.bribes.length > 0
          return gauge
        })
        .map((gauge, index) => {
          const totalTokensUSD = truncateValue(
            gauge.bribes.reduce((acc, bribe) => {
              let totalTokenUSD = 0
              const token = bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
              if (token) {
                totalTokenUSD += token.price * parseFloat(formatUnits(bribe.bribeAmount, token.decimals))
              }
              return acc + totalTokenUSD
            }, 0)
          )
          return (
            <TileCard key={index}>
              <Flex col gap={16}>
                <Flex col gap={8}>
                  <Text bold t4s>
                    {gauge.gaugeName}
                  </Text>
                  <Flex between>
                    <Text>Total Rewards</Text>
                    <Text bold>${totalTokensUSD}</Text>
                  </Flex>
                  <Flex between>
                    <Text>My Expected Reward per Vote</Text>
                    <Text bold>
                      {' '}
                      $
                      {votesData.votePower.isZero()
                        ? 0
                        : truncateValue(parseFloat(totalTokensUSD) / parseFloat(formatUnits(votesData.votePower, 18)))}
                    </Text>
                  </Flex>
                  <Flex between>
                    <Text>Reward Token(s)</Text>
                    <Flex gap={5} justifyCenter>
                      {gauge.bribes.map((bribe, index) => {
                        const token = bribeTokens.find(
                          (token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase()
                        )
                        return (
                          <img key={index} src={`https://assets.solace.fi/${token?.name.toLowerCase()}`} height={20} />
                        )
                      })}
                    </Flex>
                  </Flex>
                  {isBribeChaser && userVotes.length > 0 && (
                    <Flex between>
                      <Text>Used Percentage</Text>
                      <Text bold>
                        {(userVotes.find((vote) => vote.gaugeID.eq(gauge.gaugeID))?.votePowerBPS.toNumber() ?? 0) / 100}
                        %
                      </Text>
                    </Flex>
                  )}
                </Flex>
                <Button info onClick={() => handleSelectBribe(gauge.gaugeID)}>
                  {isBribeChaser ? 'Accept Bribe' : 'Bribe'}
                </Button>
              </Flex>
            </TileCard>
          )
        })}
    </CardContainer>
  )
}
