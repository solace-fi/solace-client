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

export const BribeList = ({ isBribeChaser }: { isBribeChaser: boolean }): JSX.Element => {
  const { isMobile } = useWindowDimensions()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedGauge, setSelectedGauge] = useState<string>('')

  const handleOpenModal = useCallback((value: boolean) => {
    setOpenModal(value)
  }, [])

  const handleSelectBribe = useCallback(
    (gaugeName: string) => {
      setSelectedGauge(gaugeName)
      handleOpenModal(true)
    },
    [handleOpenModal]
  )

  return (
    <TileCard gap={16} bgSecondary>
      <BribeProviderModal
        isOpen={openModal && !isBribeChaser}
        selectedGauge={selectedGauge}
        handleClose={() => handleOpenModal(false)}
      />
      <BribeChaserModal
        isOpen={openModal && isBribeChaser}
        selectedGauge={selectedGauge}
        handleClose={() => handleOpenModal(false)}
      />
      <Text t3s bold>
        Bribe Market
      </Text>
      <Search placeholder={'Search Bribes'} />
      {isMobile ? (
        <BribeCardContainer isBribeChaser={isBribeChaser} handleSelectBribe={handleSelectBribe} />
      ) : (
        <BribeTable isBribeChaser={isBribeChaser} handleSelectBribe={handleSelectBribe} />
      )}
    </TileCard>
  )
}

const BribeTable = ({
  isBribeChaser,
  handleSelectBribe,
}: {
  isBribeChaser: boolean
  handleSelectBribe: (gaugeName: string) => void
}): JSX.Element => {
  return (
    <>
      <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={'50vh'} maxMobileHeight={'50vh'}>
        <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
          <TableHead sticky zIndex={Z_TABLE + 1}>
            <TableRow>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Gauge Name
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Total Rewards
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Reward per Vote
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}>
                <Text t5s medium>
                  Reward Tokens(s)
                </Text>
              </TableHeader>
              <TableHeader style={{ padding: '4px' }}></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData style={{ padding: '14px 4px' }}>BTC</TableData>
              <TableData style={{ padding: '14px 4px' }}>
                <Text autoAlignVertical>$</Text>
              </TableData>
              <TableData style={{ padding: '14px 4px' }}>
                <Text autoAlignVertical>2</Text>
              </TableData>
              <TableData>
                <Flex gap={5} justifyCenter>
                  <img src={`https://assets.solace.fi/btc`} height={20} />
                  <Text autoAlignVertical semibold>
                    BTC
                  </Text>
                </Flex>
              </TableData>
              <TableData>
                <Button info onClick={() => handleSelectBribe('BTC')}>
                  {isBribeChaser ? 'Vote' : 'Bribe'}
                </Button>
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      </Scrollable>
    </>
  )
}

const BribeCardContainer = ({
  isBribeChaser,
  handleSelectBribe,
}: {
  isBribeChaser: boolean
  handleSelectBribe: (gaugeName: string) => void
}): JSX.Element => {
  return (
    <CardContainer cardsPerRow={1}>
      <TileCard>
        <Flex col gap={16}>
          <Flex col gap={8}>
            <Text bold t4s>
              BTC
            </Text>
            <Flex between>
              <Text>Total Rewards</Text>
              <Text bold>$0.0013</Text>
            </Flex>
            <Flex between>
              <Text>Reward per Vote</Text>
              <Text bold>$0.0013</Text>
            </Flex>
            <Flex between>
              <Text>Reward Token(s)</Text>
              <Flex gap={5} justifyCenter>
                <img src={`https://assets.solace.fi/btc`} height={20} />
                <Text autoAlignVertical semibold>
                  BTC
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Button info onClick={() => handleSelectBribe('BTC')}>
            {isBribeChaser ? 'Vote' : 'Bribe'}
          </Button>
        </Flex>
      </TileCard>
    </CardContainer>
  )
}
