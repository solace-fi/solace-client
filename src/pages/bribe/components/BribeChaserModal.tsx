import React from 'react'
import { Button } from '../../../components/atoms/Button'
import { StyledSlider } from '../../../components/atoms/Input'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { Modal } from '../../../components/molecules/Modal'
import { TileCard } from '../../../components/molecules/TileCard'

export const BribeChaserModal = ({
  isOpen,
  handleClose,
  selectedGauge,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGauge: string
}): JSX.Element => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={selectedGauge}>
      <Flex col gap={16}>
        <Text info textAlignCenter>
          40%
        </Text>
        <StyledSlider />
        <Flex gap={16}>
          <TileCard>
            <Text t6s bold textAlignCenter>
              Available Votes
            </Text>
            <Text bold textAlignCenter>
              600
            </Text>
          </TileCard>
          <TileCard>
            <Text t6s bold textAlignCenter>
              Votes to allocate
            </Text>
            <Text bold textAlignCenter info>
              600
            </Text>
          </TileCard>
        </Flex>
        <Button info>Allocate votes</Button>
      </Flex>
    </Modal>
  )
}
