import React, { useMemo } from 'react'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { Button, ButtonAppearance } from '../../components/atoms/Button'
import { InputSectionWrapper, StyledInput } from '../../components/atoms/Input'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'

export const DropdownInputSection = ({
  hasArrow,
  icon,
  text,
  isOpen,
  value,
  onChange,
  onClick,
  disabled,
  w,
  style,
  inputWidth,
  placeholder,
}: {
  hasArrow?: boolean
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClick?: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: JSX.Element
  text?: string
  isOpen?: boolean
  disabled?: boolean
  w?: number
  style?: React.CSSProperties
  inputWidth?: number
  placeholder?: string
}): JSX.Element => {
  const { appTheme } = useGeneral()

  const rawStyle = {
    ...style,
    width: w ? w : '100%',
    height: '56px',
    borderRadius: '12px',
    alignItems: 'center',
  }

  const gradientTextStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )
  return (
    <InputSectionWrapper style={rawStyle}>
      {icon && text && (
        <Button
          nohover
          noborder
          p={8}
          mt={12}
          ml={12}
          mb={12}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
          }}
          onClick={onClick ?? undefined}
        >
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Text>{icon}</Text>
            <Text t4 {...gradientTextStyle}>
              {text}
            </Text>
            {hasArrow && (
              <Text
                {...gradientTextStyle}
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '10px' }}
              >
                &#11206;
              </Text>
            )}
          </div>
        </Button>
      )}
      <StyledInput
        key="mainInput"
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl lg:border-0 lg:rounded-none"
        placeholder={placeholder ?? '0'}
        value={value}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', color: 'inherit', borderRadius: 'inherit', width: inputWidth ?? '100%' }}
        disabled={disabled}
      />
    </InputSectionWrapper>
  )
}

export const DropdownOptions = ({
  list,
  isOpen,
  onClick,
}: {
  list: { label: string; value: string }[]
  isOpen: boolean
  onClick: (value: string) => void
}): JSX.Element => {
  const { styles } = useCoverageContext()
  const { bigButtonStyle, gradientTextStyle } = styles

  return (
    <Accordion isOpen={isOpen} style={{ marginTop: isOpen ? 12 : 0 }} customHeight={'380px'}>
      <Flex col p={12} gap={8}>
        {list.map((item) => (
          <Flex key={item.label}>
            <ButtonAppearance {...bigButtonStyle} matchBg secondary noborder onClick={() => onClick(item.value)}>
              <Flex stretch between>
                <Text {...gradientTextStyle}>{item.label}</Text>
                <Text>{item.value}</Text>
              </Flex>
            </ButtonAppearance>
          </Flex>
        ))}
      </Flex>
    </Accordion>
  )
}
