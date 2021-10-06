import { GeneralElementProps, GeneralElementCss, MarginProps, MarginCss } from '../../generalInterfaces'
import styled, { css } from 'styled-components'
import { Text4Css } from '../Typography'

export interface ButtonProps extends ClickProps {
  secondary?: boolean
  glow?: boolean
  hidden?: boolean
  noradius?: boolean
  noborder?: boolean
  nohover?: boolean
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
  border: ${(props) => (!props.noborder ? `1px solid ${props.theme.button.border_color}` : 'none')};
  ${(props) => !props.noradius && `border-radius: 10px;`}
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
      ? `color: ${props.theme.button.text_color}; background-color: rgba(0, 0, 0, 0); opacity: 0.5; transform: scale(.9);`
      : props.secondary
      ? `color: ${props.theme.button.secondary_text_color}; background-color: ${
          props.theme.button.hover_color
        }; &:hover { ${!props.nohover && `opacity: 0.8;`} }`
      : `color: ${props.theme.button.text_color}; background-color: rgba(0, 0, 0, 0); &:hover { ${
          !props.nohover &&
          `color: ${props.theme.button.secondary_text_color}; background-color: ${props.theme.button.hover_color};`
        } }`};
  ${(props) => props.glow && `box-shadow: ${props.theme.button.glow};`}
  ${Text4Css}
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
