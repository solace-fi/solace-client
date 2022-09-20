import React from 'react'
import { StyledSlider } from '../../../components/atoms/Input'
import { Flex } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'

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
      <Flex col>
        <StyledSlider />
      </Flex>
    </Modal>
  )
}
