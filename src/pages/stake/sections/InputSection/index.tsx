import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { Tab } from '../../types/Tab'
import IconAndText, { GenericIconAndText } from './IconAndText'
import InputSectionWrapper from './InputSectionWrapper'

const StyledInput = styled.input`
  border-color: ${({ theme }) => theme.separator.bg_color};
`

export default function InputSection({
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
}): JSX.Element {
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
  disabled,
  w,
  style,
  displayIconOnMobile,
  buttonText,
  buttonOnClick,
  inputWidth,
  iconAndTextWidth,
}: {
  icon?: JSX.Element
  text?: string
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  w?: number
  style?: React.CSSProperties
  displayIconOnMobile?: boolean
  buttonText?: string
  buttonOnClick?: () => void
  inputWidth?: number
  iconAndTextWidth?: number
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
        placeholder="0"
        value={value}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', color: 'inherit', borderRadius: 'inherit', width: inputWidth ?? '100%' }}
        disabled={disabled}
      />
      {buttonText && (
        <Button m={10} onClick={buttonOnClick} disabled={disabled}>
          {buttonText}
        </Button>
      )}
    </InputSectionWrapper>
  )
}
