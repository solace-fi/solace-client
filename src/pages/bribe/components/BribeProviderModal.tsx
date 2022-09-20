import React, { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Modal } from '../../../components/molecules/Modal'
import { BalanceDropdownOptions } from '../../../components/organisms/Dropdown'
import { ReadToken } from '../../../constants/types'
import { Text } from '../../../components/atoms/Typography'
import { useGeneral } from '../../../context/GeneralManager'

export const BribeProviderModal = ({
  isOpen,
  handleClose,
  selectedGauge,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGauge: string
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const [coinsOpen, setCoinsOpen] = useState<boolean>(false)
  const [selectedCoin, setSelectedCoin] = useState<ReadToken | undefined>(undefined)

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={selectedGauge}>
      <Flex col>
        <Button
          nohover
          noborder
          p={8}
          mt={12}
          ml={12}
          mb={12}
          style={{
            justifyContent: 'center',
            height: '32px',
            backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
          }}
          onClick={() => setCoinsOpen(!coinsOpen)}
        >
          <Flex center gap={4}>
            <Text autoAlignVertical>
              {selectedCoin && <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />}
            </Text>
            <Text t4>{selectedCoin?.symbol}</Text>
            <StyledArrowDropDown style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={18} />
          </Flex>
        </Button>
        {/* <BalanceDropdownOptions
          searchedList={balanceData}
          isOpen={true}
          onClick={(value: string) => {
            setSelectedCoin(value)
            handleClose()
          }}
        /> */}
      </Flex>
    </Modal>
  )
}
