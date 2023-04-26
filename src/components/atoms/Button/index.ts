import { GeneralElementProps, GeneralElementCss, PaddingProps, PaddingCss } from '../../generalInterfaces'
import styled, { css } from 'styled-components'
import { Text4Css } from '../Typography'
import { Theme } from '../../../styles/themes'

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
  raised?: boolean
  matchBg?: boolean
  glow?: boolean
  separator?: boolean
  hidden?: boolean
  noradius?: boolean
  noborder?: boolean
  nohover?: boolean
  semibold?: boolean
  techygradient?: boolean
  warmgradient?: boolean
  noscaledown?: boolean
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
    if (props.analogical || props.matchBg) textColor = `${theme.typography.contrastText}`
    let bgColor = `${theme.typography.contrastText}`
    if (props.light) bgColor = `${theme.typography.lightText}`
    if (props.dark) bgColor = `${theme.typography.darkText}`
    if (props.analogical) bgColor = `${theme.typography.analogicalText}`
    if (props.matchBg) bgColor = `${theme.body.bg_color}`
    if (props.info) bgColor = `${theme.typography.infoText}`
    if (props.success) bgColor = `${theme.typography.successText}`
    if (props.warning) bgColor = `${theme.typography.warningText}`
    if (props.error) bgColor = `${theme.typography.errorText}`
    if (props.raised) bgColor = `${(theme as Theme).v2.raised}`
    return css`
      color: ${textColor};
      background-color: ${bgColor};
      opacity: 0.5;
      transform: ${!props.noscaledown ? css`scale(0.9)` : css`scale(1)`};
      cursor: default;
    `
  }
  if (props.disabled) {
    let textColor = `${theme.typography.contrastText}`
    if (props.light) textColor = `${theme.typography.lightText}`
    if (props.dark) textColor = `${theme.typography.darkText}`
    if (props.analogical || props.matchBg) textColor = `${theme.typography.analogicalText}`
    if (props.info) textColor = `${theme.typography.infoText}`
    if (props.success) textColor = `${theme.typography.successText}`
    if (props.warning) textColor = `${theme.typography.warningText}`
    if (props.error) textColor = `${theme.typography.errorText}`
    if (props.raised) textColor = `${(theme as Theme).v2.raised}`
    return css`
      color: ${textColor};
      background-color: rgba(0, 0, 0, 0);
      opacity: 0.5;
      transform: ${!props.noscaledown ? css`scale(0.9)` : css`scale(1)`};
    `
  }
  if (props.secondary) {
    let textColor = `${theme.typography.analogicalText}`
    if (props.light) textColor = `${theme.typography.darkText}`
    if (props.dark || props.info || props.success || props.warning || props.error) {
      textColor = `${theme.typography.lightText}`
    }
    if (props.analogical) textColor = `${theme.typography.contrastText}`
    if (props.matchBg) textColor = `${theme.typography.contrastText}`
    let bgColor = `${theme.typography.contrastText}`
    if (props.light) bgColor = `${theme.typography.lightText}`
    if (props.dark) bgColor = `${theme.typography.darkText}`
    if (props.matchBg) bgColor = `${theme.body.bg_color}`
    if (props.analogical) bgColor = `${theme.typography.analogicalText}`
    if (props.info) bgColor = `${theme.typography.infoText}`
    if (props.success) bgColor = `${theme.typography.successText}`
    if (props.warning) bgColor = `${theme.typography.warningText}`
    if (props.error) bgColor = `${theme.typography.errorText}`
    if (props.raised) bgColor = `${(theme as Theme).v2.raised}`
    if (props.techygradient) {
      return css`
        color: ${theme.typography.lightText};
        // gradient to bottom right, gradient is theme.typography.techyGradientA to theme.typography.techyGradientB
        background-image: linear-gradient(
          to bottom right,
          ${theme.typography.techyGradientA},
          ${theme.typography.techyGradientB}
        );
        opacity: 1;
        transform: scale(1);
        &:hover {
          ${!props.nohover && `opacity: 0.8;`}
        }
      `
    }
    if (props.warmgradient) {
      return css`
        color: ${theme.typography.lightText};
        // gradient to bottom right, gradient is theme.typography.warmGradientA to theme.typography.warmGradientB
        background-image: linear-gradient(
          to bottom right,
          ${theme.typography.warmGradientA},
          ${theme.typography.warmGradientB}
        );
        opacity: 1;
        transform: scale(1);
        &:hover {
          ${!props.nohover && `opacity: 0.8;`}
        }
      `
    }
    return css`
      color: ${textColor};
      background-color: ${bgColor};
      &:hover {
        ${!props.nohover && `opacity: 0.8;`}
      }
    `
  }

  let textColor: string = (theme as Theme).typography.contrastText
  let hoverTextColor: string = (theme as Theme).typography.contrastText
  let hoverBgColor: string = (theme as Theme).button.hover_color

  if (props.light) textColor = `${theme.typography.lightText}`
  if (props.dark) textColor = `${theme.typography.darkText}`
  if (props.matchBg) textColor = `${theme.body.bg_color}`
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
    if (props.dark) {
      hoverTextColor = `${theme.typography.lightText}`
      hoverBgColor = `${theme.typography.darkText}`
    }
    if (props.matchBg) {
      hoverTextColor = `${theme.typography.contrastText}`
      hoverBgColor = `${theme.body.bg_color}`
    }
    if (props.info) {
      hoverTextColor = `${theme.typography.lightText}`
      hoverBgColor = `${theme.typography.infoText}`
    }
    if (props.success) {
      hoverTextColor = `${theme.typography.lightText}`
      hoverBgColor = `${theme.typography.successText}`
    }
    if (props.warning) {
      hoverTextColor = `${theme.typography.lightText}`
      hoverBgColor = `${theme.typography.warningText}`
    }
    if (props.error) {
      hoverTextColor = `${theme.typography.lightText}`
      hoverBgColor = `${theme.typography.errorText}`
    }
    if (props.analogical) {
      hoverTextColor = `${theme.typography.contrastText}`
      hoverBgColor = `${theme.typography.analogicalText}`
    }
    if (props.raised) {
      hoverTextColor = `${theme.typography.contrastText}`
      hoverBgColor = `${(theme as Theme).v2.raised}`
    }
  }
  return css`
    color: ${textColor};
    background-color: rgba(0, 0, 0, 0);
    &:hover {
      ${!props.nohover &&
      css`
        color: ${hoverTextColor};
        background-color: ${hoverBgColor};
      `}
    }
  `
}

export const ButtonAppearanceCss = css<ButtonProps & GeneralElementProps>`
  outline: none;
  border: 1px solid ${(props) => props.theme.typography.contrastText};
  ${(props) => props.analogical && `border: 1px solid ${props.theme.typography.analogicalText};`}
  ${(props) => props.light && `border: 1px solid ${props.theme.typography.lightText};`}
  ${(props) => props.dark && `border: 1px solid ${props.theme.typography.darkText};`}
  ${(props) => props.success && `border: 1px solid ${props.theme.typography.successText};`}
  ${(props) => props.info && `border: 1px solid ${props.theme.typography.infoText};`}
  ${(props) => props.warning && `border: 1px solid ${props.theme.typography.warningText};`}
  ${(props) => props.error && `border: 1px solid ${props.theme.typography.errorText};`}
  ${(props) => props.raised && `border: 1px solid ${(props.theme as Theme).v2.raised};`}
  ${(props) => props.separator && `border: 1px solid ${props.theme.typography.separator};`}
  ${(props) => props.noborder && `border: none;`}
  ${(props) => !props.noradius && `border-radius: 10px;`}
  transition: all 0.2s, color 0.2s;
  cursor: pointer;
  visibility: ${(props) => (props.hidden ? 'hidden;' : 'visible;')};
  color: ${({ theme }) => theme.typography.contrastText};

  ${(props) => ButtonColorFunc(props, props.theme)}

  ${(props) => props.glow && `box-shadow: ${props.theme.button.glow};`}
  font-weight: ${(props) => (props.semibold ? '600' : '500')};
  font-family: 'Open Sans', sans-serif;
  ${(props) => props.pt !== undefined && 'padding-top: 4px;'}
  ${(props) => props.pb !== undefined && 'padding-bottom: 4px;'}
  ${(props) => props.pl !== undefined && 'padding-left: 16px;'}
  ${(props) => props.pr !== undefined && 'padding-right: 16px;'}
  ${(props) => props.width == undefined && 'min-width: 90px;'}
  ${(props) => props.height == undefined && 'min-height: 34px;'}
  ${Text4Css}
  ${GeneralElementCss}
`

export const ButtonBaseCss = css<ButtonProps & GeneralElementProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;

  ${ButtonAppearanceCss}
`

export const ButtonAppearance = styled.button<ButtonProps & GeneralElementProps>`
  ${ButtonAppearanceCss}
`

export const Button = styled.button<ButtonProps & GeneralElementProps>`
  ${ButtonBaseCss}
`

export const GraySquareButton = styled(Button)<{
  noborder?: boolean
  theme: Theme
  darkText?: boolean
  actuallyWhite?: boolean
  size?: number
  shadow?: boolean
  radius?: number
}>`
  border-radius: ${({ radius }) => (radius ? radius + 'px' : '10px')};
  background-color: ${({ theme, actuallyWhite }: { theme: Theme; actuallyWhite?: boolean }) =>
    actuallyWhite ? theme.v2.raised : theme.body.bg_color};
  box-sizing: border-box;
  ${({ noborder, theme }) => (noborder ? `border: none;` : `border: 1px solid ${theme.separator.bg_color};`)}
  ${({ shadow }) => shadow && `box-shadow: 0px 0px 10px -10px rgba(0, 0, 0, 1);`}
  color: ${(props) => (props.darkText ? props.theme.typography.darkText : props.theme.typography.darkText)};
  &:hover {
    background-color: ${(props) => props.theme.typography.separator};
    color: ${(props) => props.theme.typography.infoText};
  }
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

export const ThinButton = styled(Button)<{ hasBorder?: boolean; hasCustomBg?: boolean; theme: Theme }>`
  ${({ hasCustomBg, theme }) =>
    hasCustomBg
      ? ''
      : css`
          background-color: ${theme.v2.raised};
        `}
  ${({ hasBorder }) => (hasBorder ? `border-width: 1px;` : `border-width: 0;`)}
  box-shadow: 0px 0px 20px -10px rgba(138, 138, 138, 0.2);
  ${({ width }) => (width ? `min-width: ${width}px;` : 'width: 100%;')}
  height: 36px;
  border-radius: 8px;
`
