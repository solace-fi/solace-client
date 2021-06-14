import styled, { css } from 'styled-components'
import { TextProps, handleTextProps } from '../Text'

interface props {
  width?: number
}

const InputBase = css`
  ::placeholder {
    color: #fff;
    opacity: 0.5;
  }
  background-color: rgba(0, 0, 0, 0);
  border: 1px solid #fff;
  outline: none;
  color: #fff;
`

export const Input = styled.input<props & TextProps>`
  ${InputBase}
  ::-webkit-calendar-picker-indicator {
    display: none;
  }
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  padding: 4px 8px;
  border-radius: 10px;
  line-height: 19px;
  &:read-only {
    border-color: rgba(0, 0, 0, 0);
  }
  ${() => handleTextProps()}
  ${(props) => props.width && `width: ${props.width}px;`}
`

export const Search = styled.input`
  ${InputBase}
  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
    height: 1em;
    width: 1em;
    border-radius: 50em;
    background: url(https://pro.fontawesome.com/releases/v5.10.0/svgs/solid/times-circle.svg) no-repeat 50% 50%;
    background-size: contain;
    opacity: 0;
    pointer-events: none;
    filter: invert(1);
  }
  :focus::-webkit-search-cancel-button {
    opacity: 1;
    pointer-events: all;
  }
  border-radius: 30px;
  padding: 10px 20px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
`
