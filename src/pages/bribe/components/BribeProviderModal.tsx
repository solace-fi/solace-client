import React, { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'
import { BalanceDropdownOptions, DropdownInputSection } from '../../../components/organisms/Dropdown'
import { ReadToken } from '../../../constants/types'

export const BribeProviderModal = ({
  isOpen,
  handleClose,
  selectedGauge,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGauge: string
}): JSX.Element => {
  const [coinsOpen, setCoinsOpen] = useState<boolean>(false)
  const [selectedCoin, setSelectedCoin] = useState<ReadToken | undefined>(undefined)
  const [enteredAmount, setEnteredAmount] = useState<string>('')

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={selectedGauge}>
      <Flex col gap={16}>
        <Flex>
          <DropdownInputSection
            hasArrow
            isOpen={coinsOpen}
            onClick={() => setCoinsOpen(!coinsOpen)}
            value={enteredAmount}
            text={selectedCoin?.symbol}
            onChange={(e) => setEnteredAmount(e.target.value)}
            placeholder={'Amount'}
          />
        </Flex>
        {/* <BalanceDropdownOptions
          searchedList={balanceData}
          isOpen={true}
          onClick={(value: string) => {
            setSelectedCoin(value)
            handleClose()
          }}
        /> */}
        <Button info>Provide Bribe</Button>
      </Flex>
    </Modal>
  )
}
