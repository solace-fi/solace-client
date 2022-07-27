import { BigNumber } from 'ethers'
import React, { useState, useMemo } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { DropdownOptions } from './Dropdown'
import { SmallerInputSection } from '../molecules/InputSection'
import { Modal } from '../molecules/Modal'

export const ProtocolSelectionModal = ({
  show,
  lockIds,
  handleCloseModal,
  assign,
}: {
  show: boolean
  lockIds: BigNumber[]
  handleCloseModal: () => void
  assign: (protocol: string, lockIds: BigNumber[]) => void
}): JSX.Element => {
  const { seriesKit } = useCachedData()
  const [searchTerm, setSearchTerm] = useState('')

  const protocolOptions = useMemo(() => seriesKit.seriesLogos, [seriesKit.seriesLogos])

  const activeList = useMemo(
    () =>
      searchTerm ? protocolOptions.filter((item) => item.label.includes(searchTerm.toLowerCase())) : protocolOptions,
    [searchTerm, protocolOptions]
  )

  return (
    <Modal isOpen={show} handleClose={handleCloseModal} modalTitle={'Select a protocol'}>
      <SmallerInputSection
        placeholder={'Search Protocol'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
        }}
      />
      <DropdownOptions
        isOpen={true}
        searchedList={activeList}
        noneText={'No matching protocols found'}
        onClick={(value: string) => {
          assign(value, lockIds)
          handleCloseModal()
        }}
      />
    </Modal>
  )
}
