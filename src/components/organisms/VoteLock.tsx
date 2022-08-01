import React from 'react'
import { RaisedBox } from '../atoms/Box'
import { ThinButton } from '../atoms/Button'
import { StyledArrowDropDown } from '../atoms/Icon'
import { Checkbox } from '../atoms/Input'
import { Flex, ShadowDiv } from '../atoms/Layout'
import { Text } from '../atoms/Typography'

export const VoteLock = ({
  isChecked,
  onCheck,
  index,
}: {
  isChecked: boolean
  onCheck: (index: number) => void
  index: number
}): JSX.Element => {
  return (
    <ShadowDiv>
      <RaisedBox>
        <Flex between justifyCenter stretch gap={10} p={10}>
          <Flex itemsCenter>
            <Checkbox type="checkbox" checked={isChecked} onChange={() => onCheck(index)} />
          </Flex>
          <ThinButton>
            <Text autoAlignVertical p={5}>
              Icon
            </Text>
            <Text t5s style={{ width: '100%' }}>
              <Flex between>
                <Text t5s techygradient mont>
                  Protocol
                </Text>
                <StyledArrowDropDown size={16} />
              </Flex>
            </Text>
          </ThinButton>
          <ThinButton secondary techygradient>
            Vote
          </ThinButton>
        </Flex>
      </RaisedBox>
    </ShadowDiv>
  )
}
