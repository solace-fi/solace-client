import { GeneralElementProps, GeneralElementCss, PaddingProps, PaddingCss } from '../../generalInterfaces'
import styled, { css } from 'styled-components'
import { Text4Css } from '../Typography'

export interface ClickProps {
  onClick?: any
  disabled?: boolean
}

export interface ButtonProps extends ClickProps {
  analogical?: boolean
  light?: boolean
  dark?: boolean
  secondary?: boolean
  info?: boolean
  success?: boolean
  error?: boolean
  warning?: boolean
  glow?: boolean
  hidden?: boolean
  noradius?: boolean
  noborder?: boolean
  nohover?: boolean
  semibold?: boolean
}

interface ButtonWrapperProps {
  isRow?: boolean
  isColumn?: boolean
}

export const ButtonWrapperCss = css<ButtonWrapperProps>`
  ${(props) => props.isColumn && 'flex-direction: row;'}
  ${(props) => props.isColumn && 'flex-direction: column;'}
`

const ButtonColorFunc = (props: ButtonProps, theme: any) => {
  if (props.disabled && props.secondary) {
    let textColor = `${theme.typography.analogicalText}`
    if (props.light) textColor = `${theme.typography.darkText}`
    if (props.dark || props.info || props.success || props.warning || props.error) {
      textColor = `${theme.typography.lightText}`
    }
    if (props.analogical) textColor = `${theme.typography.contrastText}`
    let bgColor = `${theme.typography.contrastText}`
    if (props.light) bgColor = `${theme.typography.lightText}`
    if (props.dark) bgColor = `${theme.typography.darkText}`
    if (props.analogical) bgColor = `${theme.typography.analogicalText}`
    if (props.info) bgColor = `${theme.typography.infoText}`
    if (props.success) bgColor = `${theme.typography.successText}`
    if (props.warning) bgColor = `${theme.typography.warningText}`
    if (props.error) bgColor = `${theme.typography.errorText}`
    return `
      color: ${textColor};
      background-color: ${bgColor};
      opacity: 0.5;
      transform: scale(0.9);
    `
  }
  if (props.disabled) {
    let textColor = `${theme.typography.contrastText}`
    if (props.light) textColor = `${theme.typography.lightText}`
    if (props.dark) textColor = `${theme.typography.darkText}`
    if (props.analogical) textColor = `${theme.typography.analogicalText}`
    if (props.info) textColor = `${theme.typography.infoText}`
    if (props.success) textColor = `${theme.typography.successText}`
    if (props.warning) textColor = `${theme.typography.warningText}`
    if (props.error) textColor = `${theme.typography.errorText}`
    return `
      color: ${textColor};
      background-color: rgba(0, 0, 0, 0);
      opacity: 0.5;
      transform: scale(0.9);
    `
  }
  if (props.secondary) {
    let textColor = `${theme.typography.analogicalText}`
    if (props.light) textColor = `${theme.typography.darkText}`
    if (props.dark || props.info || props.success || props.warning || props.error) {
      textColor = `${theme.typography.lightText}`
    }
    if (props.analogical) textColor = `${theme.typography.contrastText}`
    let bgColor = `${theme.typography.contrastText}`
    if (props.light) bgColor = `${theme.typography.lightText}`
    if (props.dark) bgColor = `${theme.typography.darkText}`
    if (props.analogical) bgColor = `${theme.typography.analogicalText}`
    if (props.info) bgColor = `${theme.typography.infoText}`
    if (props.success) bgColor = `${theme.typography.successText}`
    if (props.warning) bgColor = `${theme.typography.warningText}`
    if (props.error) bgColor = `${theme.typography.errorText}`
    return `
      color: ${textColor};
      background-color: ${bgColor};
      &:hover { 
        ${!props.nohover && `opacity: 0.8;`} 
      }
    `
  }
  let textColor = `${theme.typography.contrastText}`
  let hoverTextColor = `${theme.typography.analogicalText}`
  let hoverBgColor = `${theme.typography.contrastText}`

  if (props.light) textColor = `${theme.typography.lightText}`
  if (props.dark) textColor = `${theme.typography.darkText}`
  if (props.analogical) textColor = `${theme.typography.analogicalText}`
  if (props.info) textColor = `${theme.typography.infoText}`
  if (props.success) textColor = `${theme.typography.successText}`
  if (props.warning) textColor = `${theme.typography.warningText}`
  if (props.error) textColor = `${theme.typography.errorText}`
  if (!props.nohover) {
    if (props.light) {
      hoverTextColor = `${theme.typography.darkText}`
      hoverBgColor = `${theme.typography.lightText}`
    }
    if (props.dark) hoverBgColor = `${theme.typography.darkText}`
    if (props.info) hoverBgColor = `${theme.typography.infoText}`
    if (props.success) hoverBgColor = `${theme.typography.successText}`
    if (props.warning) hoverBgColor = `${theme.typography.warningText}`
    if (props.error) hoverBgColor = `${theme.typography.errorText}`
    if (props.analogical) {
      hoverTextColor = `${theme.typography.contrastText}`
      hoverBgColor = `${theme.typography.analogicalText}`
    }
  }
  return `
    color: ${textColor};
    background-color: rgba(0, 0, 0, 0);
    &:hover {
      ${
        !props.nohover &&
        `
      color: ${hoverTextColor};
      background-color: ${hoverBgColor};
      `
      }
    }
  `
}

export const ButtonBaseCss = css<ButtonProps & GeneralElementProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: 1px solid ${(props) => props.theme.typography.contrastText};
  ${(props) => props.analogical && `border: 1px solid ${props.theme.typography.analogicalText};`}
  ${(props) => props.light && `border: 1px solid ${props.theme.typography.lightText};`}
  ${(props) => props.dark && `border: 1px solid ${props.theme.typography.darkText};`}
  ${(props) => props.success && `border: 1px solid ${props.theme.typography.successText};`}
  ${(props) => props.info && `border: 1px solid ${props.theme.typography.infoText};`}
  ${(props) => props.warning && `border: 1px solid ${props.theme.typography.warningText};`}
  ${(props) => props.error && `border: 1px solid ${props.theme.typography.errorText};`}

  ${(props) => props.noborder && `border: none;`}

  ${(props) => !props.noradius && `border-radius: 10px;`}
  font-weight: 500;
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
  color: ${({ theme }) => theme.typography.contrastText};

  ${(props) => ButtonColorFunc(props, props.theme)}

  ${(props) => props.glow && `box-shadow: ${props.theme.button.glow};`}
  font-weight: ${(props) => (props.semibold ? '600' : '500')};
  font-family: 'Open Sans', sans-serif;
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
  top: 8px;
  min-height: 30px;
  min-width: 70px;
`

export const ButtonWrapper = styled.div<PaddingProps & ButtonWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  gap: 10px;
  ${PaddingCss}
  ${ButtonWrapperCss}
`
