import styled, { css } from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { BKPT_5 } from '../../../constants'

interface BoxProps {
  color1?: boolean
  color2?: boolean
  success?: boolean
  info?: boolean
  warning?: boolean
  error?: boolean
  transparent?: boolean
  outlined?: boolean
  glow?: boolean
  shadow?: boolean
}

interface SmallBoxProps {
  successBorder?: boolean
  infoBorder?: boolean
  warningBorder?: boolean
  errorBorder?: boolean
  canHover?: boolean
  collapse?: boolean
}

const BoxCss = css<GeneralElementProps & BoxProps>`
  background: ${({ theme }) => theme.box.bg_color_1};
  ${(props) => props.transparent && 'background: rgba(0, 0, 0, 0);'}
  ${(props) =>
    props.outlined && `border-width: 1px; border-style: solid; border-color: ${props.theme.box.border_color};`}
  ${(props) => props.color1 && `background: ${props.theme.box.bg_color_1};`}
  ${(props) => props.color2 && `background: ${props.theme.box.bg_color_2};`}
  ${(props) => props.success && `background: ${props.theme.box.success};`}
  ${(props) => props.info && `background: ${props.theme.box.info};`}
  ${(props) => props.warning && `background: ${props.theme.box.warning};`}
  ${(props) => props.error && `background: ${props.theme.box.error};`}
  ${(props) => props.glow && `box-shadow: ${props.theme.box.glow};`}
  ${(props) => props.shadow && `box-shadow: ${props.theme.box.shadow};`}
  ${GeneralElementCss}
`

const BoxBase = styled(RebassBox)<{
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export default BoxBase

export const BoxRow = styled(BoxBase)`
  display: flex;
  gap: 24px;
  padding: 20px 0;
  justify-content: space-between;

  @media screen and (max-width: ${BKPT_5}px) {
    flex-direction: column;
    padding: 20px;
    gap: 10px;
  }
`

export const Box = styled(BoxRow)<BoxProps & GeneralElementProps>`
  align-items: center;
  border-radius: 10px;
  ${(props) =>
    props.p !== undefined ||
    props.pt !== undefined ||
    props.pl !== undefined ||
    props.pr !== undefined ||
    props.pb !== undefined
      ? null
      : `padding: 24px 15px;`}
  ${BoxCss}

  @media screen and (max-width: ${BKPT_5}px) {
    flex-direction: row;
  }
`

export const SmallBox = styled.div<BoxProps & SmallBoxProps & GeneralElementProps>`
  display: flex;
  ${(props) =>
    props.p !== undefined ||
    props.pt !== undefined ||
    props.pl !== undefined ||
    props.pr !== undefined ||
    props.pb !== undefined
      ? null
      : `padding: 0px 10px 0px 10px;`}
  ${(props) =>
    props.m !== undefined ||
    props.mt !== undefined ||
    props.ml !== undefined ||
    props.mr !== undefined ||
    props.mb !== undefined
      ? null
      : `margin: 0 5px 0 5px;`}
  border-radius: 10px;
  max-height: ${(props) => (props.collapse ? '0vh' : '100vh')};
  transform: ${(props) => (props.collapse ? 'scaleY(0)' : 'scaleY(1)')};
  transition: all 200ms ease;
  ${BoxCss}
  ${(props) =>
    props.successBorder &&
    `border-width: 1px; border-style: solid; border-color: ${props.theme.typography.successText};`}
  ${(props) =>
    props.infoBorder && `border-width: 1px; border-style: solid; border-color: ${props.theme.typography.infoText};`}
  ${(props) =>
    props.warningBorder &&
    `border-width: 1px; border-style: solid; border-color: ${props.theme.typography.warningText};`}
  ${(props) =>
    props.errorBorder && `border-width: 1px; border-style: solid; border-color: ${props.theme.typography.errorText};`}
  ${(props) => props.canHover && `&:hover { filter: brightness(1.5); }`}
`

export const BoxItem = styled.div`
  margin: 0 auto;
`

export const BoxItemTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  margin-bottom: 4px;
`
