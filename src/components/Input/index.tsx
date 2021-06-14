import styled from 'styled-components'
import { TextProps, handleTextProps } from '../Text'

interface props {
  width?: number
}

export const Input = styled.input<props & TextProps>`
  ::placeholder {
    color: #fff;
    opacity: 0.5;
  }
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  border: 1px solid #fff;
  outline: none;
  padding: 4px 8px;
  border-radius: 10px;
  line-height: 19px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0);
  &:read-only {
    border-color: rgba(0, 0, 0, 0);
  }
  ${() => handleTextProps()}
  ${(props) => props.width && `width: ${props.width}px;`}
`
