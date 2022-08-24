import { formatUnits } from 'ethers/lib/utils'
import React, { useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { ButtonAppearance } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { useGeneral } from '../../../context/GeneralManager'
import { floatUnits, shortenAddress, truncateValue } from '../../../utils/formatting'
import { useVoteContext } from '../VoteContext'

const TextDropdownOptions = ({
  searchedList,
  isOpen,
  noneText,
  onClick,
}: {
  searchedList: { mainText: string; secondaryText: string; icon?: JSX.Element }[]
  isOpen: boolean
  noneText?: string
  onClick: (value: string) => void
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const gradientStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )
  return (
    <Accordion
      isOpen={isOpen}
      style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }}
      customHeight={'380px'}
      noBackgroundColor
      thinScrollbar
      widthP={100}
    >
      <Flex col gap={8} p={12}>
        {searchedList.map((item) => (
          <ButtonAppearance
            key={item.mainText}
            matchBg
            secondary
            noborder
            height={37}
            pt={10.5}
            pb={10.5}
            pl={12}
            pr={12}
            onClick={() => onClick(item.mainText)}
            style={{ borderRadius: '8px' }}
          >
            <Flex stretch gap={12}>
              <Flex gap={8} itemsCenter>
                {item.icon ?? <Text {...gradientStyle}>{shortenAddress(item.mainText)}</Text>}
              </Flex>
              <Text autoAlignVertical t5s bold>
                {item.secondaryText}
              </Text>
            </Flex>
          </ButtonAppearance>
        ))}
        {searchedList.length === 0 && (
          <Text t3 textAlignCenter bold>
            {noneText ?? 'No results found'}
          </Text>
        )}
      </Flex>
    </Accordion>
  )
}

export const DelegatorSelectionModal = ({
  show,
  handleClose,
  onClick,
}: {
  show: boolean
  handleClose: () => void
  onClick: (value: string) => void
}): JSX.Element => {
  const { voteDelegators } = useVoteContext()
  const { delegatorVotesData } = voteDelegators

  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(() => {
    const filtered = searchTerm
      ? delegatorVotesData.filter((item) => item.delegator.toLowerCase().includes(searchTerm.toLowerCase()))
      : delegatorVotesData
    return filtered.map((item) => {
      return {
        mainText: item.delegator,
        secondaryText: `${truncateValue(
          (parseFloat(item.usedVotePowerBPS.toString()) / 10000) * floatUnits(item.votePower, 18),
          2
        )} used / ${truncateValue(formatUnits(item.votePower, 18), 2)} total`,
      }
    })
  }, [searchTerm, delegatorVotesData])

  return (
    <Modal isOpen={show} handleClose={handleClose} modalTitle={'Select a delegator'}>
      <SmallerInputSection
        placeholder={'Search'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
        }}
      />
      <TextDropdownOptions
        isOpen={true}
        searchedList={activeList}
        onClick={(value: string) => {
          onClick(value)
          handleClose()
        }}
      />
    </Modal>
  )
}
