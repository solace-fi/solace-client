import React from 'react'
import { Checkbox } from '../atoms/Input'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { GeneralElementProps } from '../generalInterfaces'

interface CheckboxProps {
  isChecked: boolean
  setChecked: any
  text: string
}

export const CheckboxOption: React.FC<CheckboxProps & GeneralElementProps> = ({
  isChecked,
  setChecked,
  text,
  ...props
}) => (
  <Flex {...props}>
    <Checkbox type="checkbox" checked={isChecked} onChange={(e) => setChecked(e.target.checked)} />
    <Text info textAlignCenter t3 pl={5}>
      {text}
    </Text>
  </Flex>
)
