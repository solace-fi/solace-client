import styled, { css } from 'styled-components'
import { Input } from '../Input'
import { TextStyleCss, TextStyleProps } from '../Text'
import { GeneralElementProps, GeneralElementCss } from '../generalInterfaces'

export const BoxChooseRow = styled.div<GeneralElementProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => props.mb !== undefined && 'margin-bottom: 24px;'}
  ${GeneralElementCss}
`

export const BoxChooseCol = styled.div`
  &:first-child {
    padding-right: 24px;
  }
  ${Input} {
    min-width: 0;
    width: 60px;
    text-align: center;
  }
`

export const BoxChooseDescription = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
`

const BoxChooseInfo = css<TextStyleProps>`
  font-size: 14px;
  line-height: 19px;
  ${TextStyleCss}
`

export const BoxChooseDate = styled.div`
  white-space: nowrap;
  ${BoxChooseInfo}
  white-space: nowrap;
  ${Input} {
    width: 100px;
    margin: 0 6px;

    &:last-child {
      margin-right: 0;
    }

    &::-webkit-calendar-picker-indicator {
      filter: invert(100%);
      cursor: pointer;
      margin-left: 0px;
    }
  }
`

export const BoxChooseText = styled.div`
  padding: 10px;
  ${BoxChooseInfo}
`
