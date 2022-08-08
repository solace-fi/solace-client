import React, { useState, useMemo } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { DropdownOptionsUnique } from './Dropdown'
import { SmallerInputSection } from '../molecules/InputSection'
import { Modal } from '../molecules/Modal'

export const GaugeSelectionModal = ({
  show,
  index,
  votesData,
  handleCloseModal,
  assign,
}: {
  show: boolean
  index: number
  votesData: { gauge: string; votes: string }[]
  handleCloseModal: () => void
  assign: (protocol: string, index: number) => void
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
    <Modal isOpen={show} handleClose={handleCloseModal} modalTitle={'Select a gauge'}>
      <SmallerInputSection
        placeholder={'Search'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
        }}
      />
      <DropdownOptionsUnique
        isOpen={true}
        searchedList={activeList}
        comparingList={votesData.map((voteData) => voteData.gauge)}
        noneText={'No matches found'}
        onClick={(value: string) => {
          assign(value, index)
          handleCloseModal()
        }}
      />
    </Modal>
  )
}
