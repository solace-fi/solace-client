import React from 'react'
import { Flex, Scrollable } from '../../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../../components/atoms/Table'
import { Z_TABLE } from '../../../constants'
import { Text } from '../../../components/atoms/Typography'
import { truncateValue } from '../../../utils/formatting'
import { Button } from '../../../components/atoms/Button'
import { useBribeContext } from '../BribeContext'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../../vote/VoteContext'
import { BigNumber } from '@solace-fi/sdk-nightly'

export const BribeTable = ({
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
    <>
      <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={'50vh'} maxMobileHeight={'50vh'}>
        <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
          <TableHead sticky zIndex={Z_TABLE + 1}>
            <TableRow>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Gauge
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Total Rewards
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  My Expected Reward per Vote
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Reward Token(s)
                </Text>
              </TableHeader>
              {isBribeChaser && userVotes.length > 0 && (
                <TableHeader style={{ padding: '4px' }}>
                  <Text t5s medium>
                    Used Percentage
                  </Text>
                </TableHeader>
              )}
              <TableHeader style={{ padding: '4px' }}></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
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
                    const token = bribeTokens.find(
                      (token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase()
                    )
                    if (token) {
                      totalTokenUSD += token.price * parseFloat(formatUnits(bribe.bribeAmount, token.decimals))
                    }
                    return acc + totalTokenUSD
                  }, 0)
                )
                return (
                  <TableRow key={index}>
                    <TableData style={{ padding: '14px 4px' }}>{gauge.gaugeName}</TableData>
                    <TableData style={{ padding: '14px 4px' }}>
                      <Text autoAlignVertical>${totalTokensUSD}</Text>
                    </TableData>
                    <TableData style={{ padding: '14px 4px' }}>
                      <Text autoAlignVertical>
                        $
                        {votesData.votePower.isZero()
                          ? 0
                          : truncateValue(
                              parseFloat(totalTokensUSD) / parseFloat(formatUnits(votesData.votePower, 18))
                            )}
                      </Text>
                    </TableData>
                    <TableData>
                      <Flex col gap={2}>
                        {gauge.bribes.map((bribe, index) => {
                          const token = bribeTokens.find(
                            (token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase()
                          )
                          return (
                            <Flex gap={5} justifyCenter key={index}>
                              <img src={`https://assets.solace.fi/${token?.name.toLowerCase()}`} height={20} />
                              <Text autoAlignVertical semibold>
                                {token?.symbol}
                              </Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </TableData>
                    {isBribeChaser && userVotes.length > 0 && (
                      <TableData>
                        {(userVotes.find((vote) => vote.gaugeID.eq(gauge.gaugeID))?.votePowerBPS.toNumber() ?? 0) / 100}
                        %
                      </TableData>
                    )}
                    <TableData>
                      <Button info onClick={() => handleSelectBribe(gauge.gaugeID)}>
                        {isBribeChaser ? 'Accept Bribe' : 'Bribe'}
                      </Button>
                    </TableData>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </Scrollable>
    </>
  )
}
