import React from 'react'
import { GeneralElementProps, GeneralElementCss } from '../generalInterfaces'
import styled, { css } from 'styled-components'

export interface ClickProps {
  onClick?: any
  disabled?: boolean
}

interface ButtonProps extends ClickProps {
  secondary?: boolean
  hidden?: boolean
}

const ButtonBase = styled.button<ButtonProps & GeneralElementProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: 1px solid #fff;
  border-radius: 10px;
  ${(props) =>
    props.p !== undefined ||
    props.pt !== undefined ||
    props.pl !== undefined ||
    props.pr !== undefined ||
    props.pb !== undefined
      ? null
      : `padding: 4px 16px;`}
  ${(props) => props.width == undefined && 'min-width: 90px;'}
  ${(props) => props.height == undefined && 'min-height: 34px;'}
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  transition: all 0.2s, color 0.2s;
  cursor: pointer;
  ${() => handleButtonProps()}
  ${GeneralElementCss}
`

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  gap: 5px;
`

export const handleButtonProps = (): any => {
  return css<ButtonProps>`
    visibility: ${(props) => (props.hidden ? 'hidden;' : 'visible;')};
    ${(props) =>
      props.disabled
        ? 'color: #fff; background-color: rgba(0, 0, 0, 0); opacity: 0.5; transform: scale(.9);'
        : props.secondary
        ? 'color: #7c7c7c; background-color: #fff; &:hover { opacity: 0.8; }'
        : 'color: #fff; background-color: rgba(0, 0, 0, 0); &:hover { color: #7c7c7c; background-color: #fff; }'};
  `
}

export const Button: React.FC<ButtonProps & GeneralElementProps> = ({ ...props }) => {
  return <ButtonBase {...props}>{props.children}</ButtonBase>
}
