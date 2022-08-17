import React, { useState, useMemo } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { DropdownOptionsUnique } from './Dropdown'
import { SmallerInputSection } from '../molecules/InputSection'
import { Modal } from '../molecules/Modal'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { GaugeData, VoteAllocation } from '../../constants/types'

export const GaugeSelectionModal = ({
  show,
  index,
  votesAllocationData,
  gaugesData,
  handleCloseModal,
  assign,
}: {
  show: boolean
  index: number
  votesAllocationData: VoteAllocation[]
  gaugesData: GaugeData[]
  handleCloseModal: () => void
  assign: (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => void
}): JSX.Element => {
  const { seriesKit } = useCachedData()
  const [searchTerm, setSearchTerm] = useState('')

  const gaugeNames = useMemo(() => gaugesData.map((g) => g.gaugeName), [gaugesData])
  const gaugeIds = useMemo(() => gaugesData.map((g) => g.gaugeId), [gaugesData])
  const gaugeOptions = useMemo(() => seriesKit.seriesLogos.filter((item) => gaugeNames.includes(item.label)), [
    seriesKit.seriesLogos,
    gaugeNames,
  ])

  const activeList = useMemo(
    () => (searchTerm ? gaugeOptions.filter((item) => item.label.includes(searchTerm.toLowerCase())) : gaugeOptions),
    [searchTerm, gaugeOptions]
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
        comparingList={votesAllocationData.map((voteData) => voteData.gauge)}
        noneText={'No matches found'}
        onClick={(value: string) => {
          const foundIndexOfName = gaugeNames.findIndex((name) => name === value)
          if (foundIndexOfName == -1) return
          assign(value, gaugeIds[foundIndexOfName], index, true)
          handleCloseModal()
        }}
      />
    </Modal>
  )
}
