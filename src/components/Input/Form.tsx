import styled from 'styled-components'
import { Input } from '.'
import { GeneralElementProps, GeneralElementCss } from '../generalInterfaces'

export const FormRow = styled.div<GeneralElementProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => props.mb !== undefined && 'margin-bottom: 24px;'}
  ${GeneralElementCss}
`

export const FormCol = styled.div`
  &:first-child {
    padding-right: 24px;
  }
  ${Input} {
    min-width: 0;
    width: 60px;
    text-align: center;
  }
`

export const FormSelect = styled.select`
  padding: 4px;
  font-size: inherit;
  background-color: transparent;
  color: inherit;
  border-color: white;
  line-height: inherit;
`

export const FormOption = styled.option`
  background: transparent !important;
  color: black;
`
