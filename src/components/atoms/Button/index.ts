import { GeneralElementProps, GeneralElementCss, MarginProps, MarginCss } from '../../generalInterfaces'
import styled, { css } from 'styled-components'
import { Text3Css } from '../Typography'

interface ButtonProps extends ClickProps {
  secondary?: boolean
  hidden?: boolean
}

interface ButtonWrapperProps {
  isRow?: boolean
  isColumn?: boolean
}

export interface ClickProps {
  onClick?: any
  disabled?: boolean
}

export const ButtonWrapperCss = css<ButtonWrapperProps>`
  ${(props) => props.isColumn && 'flex-direction: row;'}
  ${(props) => props.isColumn && 'flex-direction: column;'}
`

export const ButtonBaseCss = css<ButtonProps & GeneralElementProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: 1px solid #fff;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s, color 0.2s;
  cursor: pointer;
  ${(props) => props.pt !== undefined && 'padding-top: 4px;'}
  ${(props) => props.pb !== undefined && 'padding-bottom: 4px;'}
  ${(props) => props.pl !== undefined && 'padding-left: 16px;'}
  ${(props) => props.pr !== undefined && 'padding-right: 16px;'}
  ${(props) => props.width == undefined && 'min-width: 90px;'}
  ${(props) => props.height == undefined && 'min-height: 34px;'}
  visibility: ${(props) => (props.hidden ? 'hidden;' : 'visible;')};
  ${(props) =>
    props.disabled
      ? 'color: #fff; background-color: rgba(0, 0, 0, 0); opacity: 0.5; transform: scale(.9);'
      : props.secondary
      ? 'color: #7c7c7c; background-color: #fff; &:hover { opacity: 0.8; }'
      : 'color: #fff; background-color: rgba(0, 0, 0, 0); &:hover { color: #7c7c7c; background-color: #fff; }'};
  ${Text3Css}
`

export const Button = styled.button<ButtonProps & GeneralElementProps>`
  ${ButtonBaseCss}
  ${GeneralElementCss}
`

export const NavButton = styled.button`
  ${ButtonBaseCss}
  display: block;
  position: absolute;
  right: 10px;
  top: 10px;
  min-height: 40px;
  min-width: 70px;
`

export const ButtonWrapper = styled.div<MarginProps & ButtonWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  gap: 10px;
  ${MarginCss}
  ${ButtonWrapperCss}
`
