import React, { useState, useMemo } from 'react'
import { DropdownOptions } from './Dropdown'
import { SmallerInputSection } from '../molecules/InputSection'
import { Modal } from '../molecules/Modal'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { GaugeData, VoteAllocation } from '../../constants/types'

export const GaugeSelectionModal = ({
  show,
  target,
  votesAllocationData,
  gaugesData,
  handleCloseModal,
  assign,
}: {
  show: boolean
  target: {
    index?: number
    delegator?: string
  }
  votesAllocationData: VoteAllocation[]
  gaugesData: GaugeData[]
  handleCloseModal: () => void
  assign: (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => void
}): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')

  const gaugeNames = useMemo(() => gaugesData.map((g) => g.gaugeName), [gaugesData])
  const gaugeIds = useMemo(() => gaugesData.map((g) => g.gaugeId), [gaugesData])

  const gaugeOptions = useMemo(() => {
    return gaugeNames.map((name) => {
      return {
        label: name,
        value: name,
        icon: <img src={`https://assets.solace.fi/zapperLogos/${name}`} height={24} />,
      }
    })
  }, [gaugeNames])

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
      <DropdownOptions
        isOpen={true}
        searchedList={activeList}
        comparingList={votesAllocationData.map((voteData) => voteData.gauge)}
        noneText={'No matches found'}
        onClick={(value: string) => {
          const foundIndexOfName = gaugeNames.findIndex((name) => name === value)
          if (foundIndexOfName == -1) return
          assign(value, gaugeIds[foundIndexOfName], target.index ?? 0, !target.delegator)
          handleCloseModal()
        }}
      />
    </Modal>
  )
}
