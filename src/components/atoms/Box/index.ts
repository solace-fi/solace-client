import styled, { css } from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { MAX_TABLET_SCREEN_WIDTH, MOBILE_SCREEN_MARGIN } from '../../../constants'

interface BoxProps {
  purple?: boolean
  green?: boolean
  navy?: boolean
  transparent?: boolean
  outlined?: boolean
  glow?: boolean
  shadow?: boolean
}

interface SmallBoxProps {
  error?: boolean
  collapse?: boolean
}

const BoxCss = css<GeneralElementProps & BoxProps>`
  background-color: ${({ theme }) => theme.box.bg_color};
  ${(props) => props.transparent && 'background-color: rgba(0, 0, 0, 0);'}
  ${(props) => props.outlined && BoxOutline}
  ${(props) => props.purple && `background-color: ${props.theme.box.purple};`}
  ${(props) => props.green && `background-color: ${props.theme.box.green};`}
  ${(props) => props.navy && `background-color: ${props.theme.box.navy};`}
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

  @media screen and (max-width: ${MAX_TABLET_SCREEN_WIDTH}px) {
    flex-direction: column;
    padding: 20px ${MOBILE_SCREEN_MARGIN}px;
    gap: 10px;
  }
`

const BoxOutline = css`
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.box.border_color};
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

  @media screen and (max-width: ${MAX_TABLET_SCREEN_WIDTH}px) {
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
  ${(props) => (props.collapse ? `transform: scaleY(0); height: 0;` : `transform: scaleY(1);`)}
  transition: all 200ms ease;
  ${BoxCss}
  ${(props) => props.error && `border-color: ${props.theme.box.smallbox_border_color};`}
`

export const BoxItem = styled.div`
  margin: 0 auto;
`

export const BoxItemTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  margin-bottom: 4px;
`
