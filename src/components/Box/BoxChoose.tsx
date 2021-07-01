import styled, { css } from 'styled-components'
import { Input } from '../Input'

interface props {
  bold?: boolean
  warning?: boolean
}

export const BoxChooseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

const BoxChooseInfo = css<props>`
  font-size: 14px;
  line-height: 19px;
  ${(props) => props.bold && 'font-weight: 600;'}
  ${(props) => props.warning && 'color: rgba(255, 12, 28);'}
`

export const BoxChooseDate = styled.div`
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
  ${BoxChooseInfo}
`
