import styled from 'styled-components'
import { Input } from '../Input'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../../atoms/Typography'

export const FormRow = styled.div<GeneralElementProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => props.mb === undefined && 'margin-bottom: 24px;'}
  ${GeneralElementCss}
`

export const FormCol = styled.div<GeneralElementProps & GeneralTextProps>`
  &:first-child {
    padding-right: 24px;
  }
  ${Input} {
    min-width: 0;
    width: 60px;
    text-align: center;
  }
  ${GeneralElementCss}
  ${GeneralTextCss}
`

export const FormSelect = styled.select`
  padding: 4px;
  font-size: inherit;
  background-color: ${({ theme }) => theme.form.bg_color};
  color: inherit;
  border-color: ${({ theme }) => theme.form.border_color};
  line-height: inherit;
  outline: none !important;
  min-width: 100px;
  border-radius: 10px;
`

export const FormOption = styled.option`
  color: ${({ theme }) => theme.form.option_color};
`
