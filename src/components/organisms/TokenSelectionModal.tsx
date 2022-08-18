import React, { useState } from 'react'
import { Z_MODAL } from '../../constants'
import { TokenInfo } from '../../constants/types'
import { SmallerInputSection } from '../molecules/InputSection'
import { Modal } from '../molecules/Modal'
import { BalanceDropdownOptions } from './Dropdown'

export const TokenSelectionModal = ({
  show,
  balanceData,
  handleSelectedCoin,
  handleCloseModal,
}: {
  show: boolean
  balanceData: TokenInfo[]
  handleSelectedCoin: (coin: string) => void
  handleCloseModal: () => void
}): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <Modal isOpen={show} handleClose={handleCloseModal} modalTitle={'Select a Token'} zIndex={Z_MODAL + 1}>
      <SmallerInputSection
        placeholder={'Search'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '250px',
          border: 'none',
        }}
      />
      <BalanceDropdownOptions
        searchedList={balanceData}
        isOpen={true}
        onClick={(value: string) => {
          handleSelectedCoin(value)
          handleCloseModal()
        }}
      />
    </Modal>
  )
}
