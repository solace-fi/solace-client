import React, { useCallback, useState } from 'react'
import { Flex, Scrollable } from '../../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../../components/atoms/Table'
import { Z_TABLE } from '../../../constants'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { Text } from '../../../components/atoms/Typography'
import { truncateValue } from '../../../utils/formatting'
import { CardContainer } from '../../../components/atoms/Card'
import { Button } from '../../../components/atoms/Button'
import { Search } from '../../../components/atoms/Input'
import { TileCard } from '../../../components/molecules/TileCard'
import { BribeProviderModal } from './BribeProviderModal'
import { BribeChaserModal } from './BribeChaserModal'
import { useBribeContext } from '../BribeContext'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../../vote/VoteContext'
import { Loader } from '../../../components/atoms/Loader'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'

export const BribeList = ({ isBribeChaser }: { isBribeChaser: boolean }): JSX.Element => {
  const { isMobile } = useWindowDimensions()
  const { intrface } = useBribeContext()
  const { bribeTokensLoading, gaugeBribeInfoLoading } = intrface
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedGaugeId, setSelectedGaugeId] = useState<BigNumber>(ZERO)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const handleOpenModal = useCallback((value: boolean) => {
    setOpenModal(value)
  }, [])

  const handleSelectBribe = useCallback(
    (id: BigNumber) => {
      setSelectedGaugeId(id)
      handleOpenModal(true)
    },
    [handleOpenModal]
  )

  return (
    <TileCard gap={16} bgSecondary>
      <BribeProviderModal
        isOpen={openModal && !isBribeChaser}
        selectedGaugeId={selectedGaugeId}
        handleClose={() => handleOpenModal(false)}
      />
      <BribeChaserModal
        isOpen={openModal && isBribeChaser}
        selectedGaugeId={selectedGaugeId}
        handleClose={() => handleOpenModal(false)}
      />
      <Text t3s bold>
        Bribe Market
      </Text>
      <Search placeholder={'Search Bribes'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      {!bribeTokensLoading &&
        !gaugeBribeInfoLoading &&
        (isMobile ? (
          <BribeCardContainer
            isBribeChaser={isBribeChaser}
            handleSelectBribe={handleSelectBribe}
            searchTerm={searchTerm}
          />
        ) : (
          <BribeTable isBribeChaser={isBribeChaser} handleSelectBribe={handleSelectBribe} searchTerm={searchTerm} />
        ))}
      {(bribeTokensLoading || gaugeBribeInfoLoading) && <Loader />}
    </TileCard>
  )
}

const BribeTable = ({
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
  const { gaugeBribeInfo, bribeTokens } = bribes

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
                  My Reward per Vote
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Reward Token(s)
                </Text>
              </TableHeader>
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
                    .map(
                      (bribe) =>
                        bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
                          ?.symbol
                    )
                    .includes(searchTerm.toLowerCase()) ||
                  gauge.bribes
                    .map(
                      (bribe) =>
                        bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
                          ?.name
                    )
                    .includes(searchTerm.toLowerCase())
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
                    <TableData>
                      <Button info onClick={() => handleSelectBribe(gauge.gaugeID)}>
                        {isBribeChaser ? 'Vote' : 'Bribe'}
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

const BribeCardContainer = ({
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
  const { gaugeBribeInfo, bribeTokens } = bribes

  return (
    <CardContainer cardsPerRow={1}>
      {gaugeBribeInfo
        .filter((gauge) => {
          if (searchTerm == '') return gauge
          return (
            gauge.gaugeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gauge.bribes
              .map(
                (bribe) =>
                  bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())?.symbol
              )
              .includes(searchTerm.toLowerCase()) ||
            gauge.bribes
              .map(
                (bribe) =>
                  bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())?.name
              )
              .includes(searchTerm.toLowerCase())
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
                    <Text>My Reward per Vote</Text>
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
                </Flex>
                <Button info onClick={() => handleSelectBribe(gauge.gaugeID)}>
                  {isBribeChaser ? 'Vote' : 'Bribe'}
                </Button>
              </Flex>
            </TileCard>
          )
        })}
    </CardContainer>
  )
}
