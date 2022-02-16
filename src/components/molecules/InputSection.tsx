import React from 'react'
import styled from 'styled-components'
import { Button } from '../atoms/Button'
import { Tab } from '../../constants/enums'
import { GenericIconAndText, IconAndText } from './IconAndText'
import { InputSectionWrapper } from '../atoms/Input'

const StyledInput = styled.input`
  border-color: ${({ theme }) => theme.separator.bg_color};
`

export const InputSection = ({
  tab,
  value,
  onChange,
  setMax,
  disabled,
}: // ref,
{
  tab?: Tab.DEPOSIT | Tab.LOCK | Tab.WITHDRAW
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax?: () => void
  disabled?: boolean
}): JSX.Element => {
  return (
    <InputSectionWrapper>
      {tab ? <IconAndText tab={tab} disabled={disabled} /> : <></>}
      <StyledInput
        key="mainInput"
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl lg:border-0 lg:rounded-none"
        placeholder="0"
        value={value}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', color: 'inherit', borderRadius: 'inherit', width: '100%' }}
        disabled={disabled}
      />
      {setMax && (
        <Button onClick={setMax} disabled={disabled} m={10}>
          MAX
        </Button>
      )}
    </InputSectionWrapper>
  )
}

export const GenericInputSection = ({
  icon,
  text,
  value,
  onChange,
  buttonDisabled,
  disabled,
  w,
  style,
  displayIconOnMobile,
  buttonText,
  buttonOnClick,
  inputWidth,
  iconAndTextWidth,
  placeholder,
}: {
  icon?: JSX.Element
  text?: string
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  buttonDisabled?: boolean
  disabled?: boolean
  w?: number
  style?: React.CSSProperties
  displayIconOnMobile?: boolean
  buttonText?: string
  buttonOnClick?: () => void
  inputWidth?: number
  iconAndTextWidth?: number
  placeholder?: string
}): JSX.Element => {
  const rawStyle = {
    ...style,
    // width: w ? w : '335px',
    width: w ? w : '100%',
    height: '64px',
  }
  return (
    <InputSectionWrapper style={rawStyle}>
      {icon && text && (
        <GenericIconAndText
          icon={icon}
          text={text}
          disabled={disabled}
          displayOnMobile={displayIconOnMobile}
          width={iconAndTextWidth}
        />
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
      {buttonText && (
        <Button
          m={10}
          onClick={buttonOnClick}
          disabled={buttonDisabled}
          info
          style={
            buttonDisabled
              ? {
                  cursor: 'default',
                }
              : {}
          }
        >
          {buttonText}
        </Button>
      )}
    </InputSectionWrapper>
  )
}
