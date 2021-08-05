import styled, { css } from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { MAX_MOBILE_SCREEN_WIDTH, MOBILE_SCREEN_MARGIN } from '../../../constants'

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
  background-color: rgba(0, 255, 209, 0.3);
  ${(props) => props.transparent && 'background-color: rgba(0, 0, 0, 0);'}
  ${(props) => props.outlined && BoxOutline}
  ${(props) => props.purple && 'background-color: rgba(250, 0, 255, 0.3);'}
  ${(props) => props.green && 'background-color: rgba(0, 187, 40, 0.7);'}
  ${(props) => props.navy && 'background-color: rgba(16, 32, 97, 0.3);'}
  ${(props) => props.glow && 'box-shadow: 0 0 7px #fff;'}
  ${(props) => props.shadow && 'box-shadow: 0 3px 3px rgba(0, 0, 0, 0.5);'}
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

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    flex-direction: column;
    padding: 20px ${MOBILE_SCREEN_MARGIN}px;
    gap: 10px;
  }
`

const BoxOutline = css`
  border-width: 1px;
  border-style: solid;
  border-color: rgb(255, 255, 255);
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
      : `padding: 24px;`}
  ${BoxCss}

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    flex-direction: row;
  }
`

export const SmallBox = styled.div<BoxProps & SmallBoxProps & GeneralElementProps>`
  ${(props) => props.error && `border-color: rgba(219, 44, 56);`}
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
`

export const BoxItem = styled.div`
  margin: 0 auto;
`

export const BoxItemTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  margin-bottom: 4px;
`
