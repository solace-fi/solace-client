import React, { useMemo } from 'react'
import { Accordion } from '../atoms/Accordion'
import { Button, ButtonAppearance } from '../atoms/Button'
import { InputSectionWrapper, StyledInput } from '../atoms/Input'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import { capitalizeFirstLetter } from '../../utils/formatting'
import { TokenInfo } from '../../constants/types'
import { formatUnits } from 'ethers/lib/utils'
import { truncateValue } from '../../utils/formatting'
import { StyledArrowDropDown } from '../atoms/Icon'

export function processProtocolName(str: string): string {
  // remove hyphen & capitalize first letter of each word
  return str
    .split('-')
    .map((word) => {
      switch (word.toLowerCase()) {
        case 'amm':
        case 'apy':
          return word.toUpperCase()
        case 'defi':
          return 'DeFi'
        case 'defisaver':
          return 'DeFi Saver'
        case 'deversifi':
          return 'DeversiFi'
        case 'derivadex':
          return 'DerivaDEX'
        case 'dao':
          return 'DAO'
        case 'liquiddriver':
          return 'LiquidDriver'
        case 'tokensets':
          return 'TokenSets'
        case 'wepiggy':
          return 'WePiggy'
        case 'waultswap':
          return 'WaultSwap'
        case 'stormswap':
          return 'StormSwap'
        case 'spiritswap':
          return 'SpiritSwap'
        case 'spookyswap':
          return 'SpookySwap'
        case 'snowswap':
          return 'SnowSwap'
        case 'shapeshift':
          return 'ShapeShift'
        case 'yieldyak':
          return 'Yield Yak'
        default:
          return capitalizeFirstLetter(word)
      }
    })
    .join(' ')
}

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

  const gradientStyle = useMemo(
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
              <Text t4 {...gradientStyle}>
                {text}
              </Text>
            )}
            {hasArrow && (
              <StyledArrowDropDown style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={18} />
            )}
          </Flex>
        </Button>
      )}
      <StyledInput
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl lg:border-0 lg:rounded-none"
        placeholder={placeholder ?? '0'}
        value={value ?? ''}
        onChange={onChange}
        style={{
          backgroundColor: 'inherit',
          color: 'inherit',
          borderRadius: 'inherit',
          width: inputWidth ?? '100%',
          fontFamily: 'Open Sans',
          height: '10px',
        }}
        disabled={disabled}
      />
    </InputSectionWrapper>
  )
}

export const DropdownOptions = ({
  searchedList,
  isOpen,
  noneText,
  onClick,
}: {
  searchedList: { label: string; value: string; icon?: JSX.Element }[]
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
    >
      <Flex col gap={8} p={12}>
        {searchedList.map((item, i) => (
          <ButtonAppearance
            key={i}
            matchBg
            secondary
            noborder
            height={37}
            pt={10.5}
            pb={10.5}
            pl={12}
            pr={12}
            onClick={() => onClick(item.value)}
            style={{ borderRadius: '8px' }}
          >
            <Flex stretch gap={12}>
              <Flex gap={8} itemsCenter>
                {item.icon ?? <Text {...gradientStyle}>{item.label}</Text>}
              </Flex>
              <Text autoAlignVertical t5s bold>
                {processProtocolName(item.value)}
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

export const DropdownOptionsUnique = ({
  comparingList,
  searchedList,
  isOpen,
  noneText,
  onClick,
  processName = true,
  customProcessFunction,
}: {
  comparingList: string[]
  searchedList: { label: string; value: string; icon?: JSX.Element }[]
  isOpen: boolean
  noneText?: string
  onClick: (value: string) => void
  processName?: boolean
  customProcessFunction?: (value: string) => string
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
      customHeight={'280px'}
      noBackgroundColor
      thinScrollbar
    >
      <Flex col gap={8} px={12}>
        {searchedList.map((item, i) => (
          <ButtonAppearance
            key={i}
            matchBg
            secondary
            noborder
            height={37}
            pt={10.5}
            pb={10.5}
            pl={12}
            pr={12}
            onClick={() => onClick(item.value)}
            disabled={comparingList.includes(item.label)}
            style={{ borderRadius: '8px' }}
          >
            <Flex stretch gap={12}>
              <Flex gap={8} itemsCenter>
                {item.icon ?? (
                  <Text {...gradientStyle} bold>
                    {item.label}
                  </Text>
                )}
              </Flex>
              <Text autoAlignVertical t5s bold>
                {processName
                  ? customProcessFunction
                    ? customProcessFunction(item.value)
                    : processProtocolName(item.value)
                  : item.value}
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

export const BalanceDropdownOptions = ({
  searchedList,
  isOpen,
  noneText,
  onClick,
}: {
  searchedList: TokenInfo[]
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
    <Accordion isOpen={isOpen} style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }} customHeight={'380px'}>
      <Flex col gap={8} p={12}>
        {searchedList.map((item, i) => (
          <ButtonAppearance
            key={i}
            py={16}
            widthP={100}
            matchBg
            secondary
            noborder
            onClick={() => onClick(item.address)}
          >
            <Flex stretch between pl={16} pr={16}>
              <Flex gap={8} itemsCenter>
                <img src={`https://assets.solace.fi/${item.name.toLowerCase()}`} width={16} height={16} />
                <Text {...gradientStyle}>{item.symbol}</Text>
              </Flex>
              <Text autoAlignVertical>
                {item.price > 0
                  ? `~$${truncateValue(parseFloat(formatUnits(item.balance, item.decimals)) * item.price, 2)}`
                  : `${truncateValue(formatUnits(item.balance, item.decimals), 2)}`}
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
