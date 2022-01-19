import React from 'react'
import styled, { css } from 'styled-components'
import { GeneralElementProps } from '../../../components/generalInterfaces'
import { InfoBoxType } from '../types/InfoBoxType'
import Twiv from './Twiv'
import { StyledInfo } from '../../../components/atoms/Icon'

// border-[#5F5DF9] bg-[#F7F7FF] text-[#5F5DF9]
const infoCss = css`
  /* border-color: #5f5df9; */
  ${(props) => `color: ${props.theme.typography.infoText};`}
  ${(props) => `border-color: ${props.theme.typography.infoText};`}
  /* color: #5f5df9; */
  /* background-color: #f7f7ff; */
  ${(props) => `background-color: ${props.theme.v2.raised};`}
`

// border-[#F04D42] text-[#F04D42] bg-[#FEF6F5]
const errorCss = css`
  /* border-color: #f04d42; */
  color: #f04d42;
  ${(props) => `color: ${props.theme.typography.errorText};`}
  ${(props) => `border-color: ${props.theme.typography.errorText};`}
  /* background-color: #fef6f5; */
  ${(props) => `background-color: ${props.theme.v2.aside};`}
`

const StyledInfoBox = styled.div<{ type: InfoBoxType }>`
  display: flex;
  border: 1px solid;
  margin-top: 8px;
  ${(props) => (props.type === InfoBoxType.info ? infoCss : props.type === InfoBoxType.error ? errorCss : '')}
`

const switchStyles = (type: InfoBoxType) => {
  switch (type) {
    case InfoBoxType.info:
      return css`
        color: ${(props) => props.theme.infoText};
      `
    case InfoBoxType.error:
      return css`
        color: ${(props) => props.theme.errorText};
      `
    default:
      return ''
  }
}

const InfoWrapper = styled.div<{ type: InfoBoxType }>`
  ${({ type }) => switchStyles(type)}
`

const StyledStyledInfo = styled(StyledInfo)`
  height: 20px;
  width: 20px;
  padding: 26px;
`

export default function InformationBox({ type, text }: { type: InfoBoxType; text: string }): JSX.Element {
  return (
    <StyledInfoBox type={type} className="flex border rounded-xl items-center h-20 pr-7 text-xs font-medium">
      <InfoWrapper type={type}>
        <StyledStyledInfo />
      </InfoWrapper>
      {/* right text */}
      <Twiv css="leading-5">{text}</Twiv>
    </StyledInfoBox>
  )
}
