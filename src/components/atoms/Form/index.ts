import styled from 'styled-components'
import { Input } from '../Input'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../../atoms/Typography'

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
