import React, { useMemo, useState } from 'react'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { Button, ButtonAppearance } from '../../components/atoms/Button'
import { InputSectionWrapper, StyledInput } from '../../components/atoms/Input'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import { TableRow } from '../../components/atoms/Table'

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
      {(icon || text) && (
        <Button
          nohover
          noborder
          p={8}
          mt={12}
          ml={12}
          mb={12}
          widthP={100}
          style={{
            justifyContent: 'center',
            height: '32px',
            backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
          }}
          onClick={onClick ?? undefined}
        >
          <Flex center gap={4}>
            {icon && <Text autoAlignVertical>{icon}</Text>}
            {text && (
              <Text t4 {...gradientTextStyle}>
                {text}
              </Text>
            )}
            {hasArrow && (
              <Text
                autoAlignVertical
                {...gradientTextStyle}
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '10px' }}
              >
                &#11206;
              </Text>
            )}
          </Flex>
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
  noneText,
  onClick,
}: {
  list: { label: string; value: string; icon?: JSX.Element }[]
  isOpen: boolean
  searchFeature?: boolean
  noneText?: string
  onClick: (value: string) => void
}): JSX.Element => {
  const { styles } = useCoverageContext()
  const { bigButtonStyle, gradientTextStyle } = styles

  return (
    <Accordion isOpen={isOpen} style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }} customHeight={'380px'}>
      <Flex col gap={8} p={12}>
        {list.map((item) => (
          <ButtonAppearance
            key={item.label}
            {...bigButtonStyle}
            matchBg
            secondary
            noborder
            onClick={() => onClick(item.value)}
          >
            <Flex stretch between pl={16} pr={16}>
              <Flex gap={8} itemsCenter>
                {item.icon ?? <Text {...gradientTextStyle}>{item.label}</Text>}
              </Flex>
              <Text autoAlignVertical>{item.value}</Text>
            </Flex>
          </ButtonAppearance>
        ))}
        {list.length === 0 && (
          <Text t3 textAlignCenter bold>
            {noneText ?? 'No results found'}
          </Text>
        )}
      </Flex>
    </Accordion>
  )
}
