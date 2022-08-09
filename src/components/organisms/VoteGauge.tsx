import React, { useMemo } from 'react'
import { ButtonAppearance, GraySquareButton, ThinButton } from '../atoms/Button'
import { StyledArrowDropDown, StyledClose } from '../atoms/Icon'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { SmallerInputSection } from '../molecules/InputSection'
import { processProtocolName } from './Dropdown'

export const VoteGauge = ({
  handleGaugeSelectionModal,
  onVoteInput,
  deleteVote,
  votesData,
  index,
}: {
  handleGaugeSelectionModal: (index: number) => void
  onVoteInput: (input: string, index: number) => void
  deleteVote: (index: number) => void
  votesData: {
    gauge: string
    votes: string
  }[]
  index: number
}): JSX.Element => {
  const appId = useMemo(() => votesData[index].gauge, [votesData, index])

  return (
    <ButtonAppearance secondary matchBg noborder nohover p={10}>
      <Flex gap={10}>
        <div style={{ width: '150px' }}>
          <ThinButton onClick={() => handleGaugeSelectionModal(index)}>
            <Flex style={{ width: '100%' }} itemsCenter>
              <Text autoAlignVertical p={5}>
                <img src={`https://assets.solace.fi/zapperLogos/${appId}`} height={16} />
              </Text>
              <Text t5s style={{ width: '100%' }}>
                <Flex between>
                  <Text t5s techygradient mont>
                    {appId != '' ? processProtocolName(appId) : 'Choose Protocol'}
                  </Text>
                  <StyledArrowDropDown size={16} />
                </Flex>
              </Text>
            </Flex>
          </ThinButton>
        </div>
        <div style={{ width: '100px' }}>
          <SmallerInputSection
            placeholder={'Number of Votes'}
            value={votesData[index].votes}
            onChange={(e) => onVoteInput(e.target.value, index)}
          />
        </div>
      </Flex>
    </ButtonAppearance>
  )
}
