import React from 'react'
import styled from 'styled-components'
import { Button } from '../atoms/Button'
import { Tab } from '../../constants/enums'
import { GenericIconAndText, IconAndText } from './IconAndText'
import { InputSectionWrapper } from '../atoms/Input'
import { Theme } from '../../styles/themes'

export const StyledInput = styled.input`
  border-color: ${({ theme }) => theme.separator.bg_color};
`

export const InputSection = ({
  tab,
  value,
  onChange,
  setMax,
  disabled,
  readonly,
  placeholder,
}: {
  tab?: Tab.DEPOSIT | Tab.LOCK | Tab.WITHDRAW
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax?: () => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
}): JSX.Element => {
  return (
    <InputSectionWrapper>
      {tab ? <IconAndText tab={tab} disabled={disabled} /> : <></>}
      <StyledInput
        key="mainInput"
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl lg:border-0 lg:rounded-none"
        placeholder={placeholder ?? '0'}
        value={value ?? ''}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', color: 'inherit', borderRadius: 'inherit', width: '100%' }}
        disabled={disabled}
        readOnly={readonly}
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
  h,
  style,
  displayIconOnMobile,
  buttonText,
  buttonOnClick,
  inputWidth,
  iconAndTextWidth,
  placeholder,
  readonly,
}: {
  icon?: JSX.Element
  text?: string
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  buttonDisabled?: boolean
  disabled?: boolean
  w?: number
  h?: number
  style?: React.CSSProperties
  displayIconOnMobile?: boolean
  buttonText?: string
  buttonOnClick?: () => void
  inputWidth?: number
  iconAndTextWidth?: number
  placeholder?: string
  readonly?: boolean
}): JSX.Element => {
  const rawStyle = {
    ...style,
    width: w ? w : '100%',
    height: h ? h : '64px',
  }
  return (
    <InputSectionWrapper style={rawStyle}>
      {icon && (
        <GenericIconAndText
          icon={icon}
          text={text}
          disabled={disabled}
          displayOnMobile={displayIconOnMobile}
          width={iconAndTextWidth}
        />
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
        }}
        disabled={disabled}
        readOnly={readonly}
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

export const SmallerInputSection = styled.input<{ asideBg?: boolean; theme: Theme }>`
  border-color: ${({ theme }: { theme: Theme }) => theme.separator.bg_color} !important;
  width: 100%;
  height: 36px !important;
  border-radius: 8px !important;
  border-width: 1px !important;
  border-style: solid !important;
  padding: 6px 16px !important;
  font-size: 12px !important;
  font-family: 'Open Sans', sans-serif !important;
  box-sizing: border-box !important;
  color: ${({ theme }: { theme: Theme }) => theme.typography.contrastText} !important;
  background-color: ${({ theme }: { theme: Theme }) => theme.v2.raised} !important;
  outline: none !important;
  &:focus,
  &:hover {
    border-color: ${({ theme }: { theme: Theme }) => theme.separator.bg_color} !important;
    filter: brightness(120%);
  }
  ${({ theme, asideBg }: { theme: Theme; asideBg?: boolean }) =>
    asideBg && `background-color: ${theme.body.bg_color} !important;`}
`
