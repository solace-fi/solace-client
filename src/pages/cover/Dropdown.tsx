import React, { useMemo, useState } from 'react'
import { useCoverageContext } from './CoverageContext'
import { Accordion } from '../../components/atoms/Accordion'
import { Button, ButtonAppearance } from '../../components/atoms/Button'
import { InputSectionWrapper, StyledInput } from '../../components/atoms/Input'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import { Table, TableBody, TableHead, TableRow } from '../../components/atoms/Table'
import { GenericInputSection } from '../../components/molecules/InputSection'

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
          widthP={100}
          style={{
            justifyContent: 'center',
            height: '32px',
            backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
          }}
          onClick={onClick ?? undefined}
        >
          <Flex center gap={4}>
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
  searchFeature,
  onClick,
}: {
  list: { label: string; value: string; icon?: JSX.Element }[]
  isOpen: boolean
  searchFeature?: boolean
  onClick: (value: string) => void
}): JSX.Element => {
  const { styles } = useCoverageContext()
  const { bigButtonStyle, gradientTextStyle } = styles

  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(() => (searchTerm ? list.filter((item) => item.label.includes(searchTerm)) : list), [
    searchTerm,
    list,
  ])

  return (
    <Accordion isOpen={isOpen} style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }} customHeight={'380px'}>
      <Flex pl={12} pr={12} pt={5} pb={5}>
        <Table style={{ borderSpacing: '0px 8px' }}>
          <TableHead sticky translation={8}>
            {searchFeature && (
              <TableRow>
                <GenericInputSection
                  placeholder={'Search Protocol'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  h={40}
                  style={{ marginTop: 10, marginBottom: 10 }}
                />
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {activeList.map((item) => (
              <TableRow key={item.label}>
                <ButtonAppearance {...bigButtonStyle} matchBg secondary noborder onClick={() => onClick(item.value)}>
                  <Flex stretch between pl={16} pr={16}>
                    <Flex gap={8} itemsCenter>
                      {item.icon ?? <Text {...gradientTextStyle}>{item.label}</Text>}
                    </Flex>
                    <Text autoAlignVertical>{item.value}</Text>
                  </Flex>
                </ButtonAppearance>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Flex>
    </Accordion>
  )
}
