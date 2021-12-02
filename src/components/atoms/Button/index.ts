import { GeneralElementProps, GeneralElementCss, PaddingProps, PaddingCss } from '../../generalInterfaces'
import styled, { css } from 'styled-components'
import { GeneralTextProps, GeneralTextCss, Text4Css } from '../Typography'

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
}

interface ButtonWrapperProps {
  isRow?: boolean
  isColumn?: boolean
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

  ${(props) =>
    props.disabled
      ? `color: ${
          props.light
            ? props.theme.typography.lightText
            : props.dark
            ? props.theme.typography.darkText
            : props.analogical
            ? props.theme.typography.analogicalText
            : props.info
            ? props.theme.typography.infoText
            : props.success
            ? props.theme.typography.successText
            : props.warning
            ? props.theme.typography.warningText
            : props.error
            ? props.theme.typography.errorText
            : props.theme.typography.contrastText
        }; background-color: rgba(0, 0, 0, 0); opacity: 0.5; transform: scale(.9);`
      : props.secondary
      ? `color: ${
          props.light
            ? props.theme.typography.darkText
            : props.dark || props.info || props.success || props.warning || props.error
            ? props.theme.typography.lightText
            : props.analogical
            ? props.theme.typography.contrastText
            : props.theme.typography.analogicalText
        }; background-color: ${
          props.light
            ? props.theme.typography.lightText
            : props.dark
            ? props.theme.typography.darkText
            : props.analogical
            ? props.theme.typography.analogicalText
            : props.info
            ? props.theme.typography.infoText
            : props.success
            ? props.theme.typography.successText
            : props.warning
            ? props.theme.typography.warningText
            : props.error
            ? props.theme.typography.errorText
            : props.theme.typography.contrastText
        }; &:hover { ${!props.nohover && `opacity: 0.8;`} }`
      : `color: ${
          props.light
            ? props.theme.typography.lightText
            : props.dark
            ? props.theme.typography.darkText
            : props.analogical
            ? props.theme.typography.analogicalText
            : props.info
            ? props.theme.typography.infoText
            : props.success
            ? props.theme.typography.successText
            : props.warning
            ? props.theme.typography.warningText
            : props.error
            ? props.theme.typography.errorText
            : props.theme.typography.contrastText
        }; background-color: rgba(0, 0, 0, 0); &:hover { ${
          !props.nohover &&
          `color: ${
            props.light
              ? props.theme.typography.darkText
              : props.dark || props.info || props.success || props.warning || props.error
              ? props.theme.typography.lightText
              : props.analogical
              ? props.theme.typography.contrastText
              : props.theme.typography.analogicalText
          }; background-color: ${
            props.light
              ? props.theme.typography.lightText
              : props.dark
              ? props.theme.typography.darkText
              : props.analogical
              ? props.theme.typography.analogicalText
              : props.info
              ? props.theme.typography.infoText
              : props.success
              ? props.theme.typography.successText
              : props.warning
              ? props.theme.typography.warningText
              : props.error
              ? props.theme.typography.errorText
              : props.theme.typography.contrastText
          };`
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
