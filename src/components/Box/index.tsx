import styled, { css } from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'
import { TextProps, handleTextProps } from '../Text'
import { GenericProps, handleGenericProps } from '../interfaces'

interface BoxProps {
  purple?: boolean
  transparent?: boolean
  outlined?: boolean
}

const BoxPropsHandler = css<GenericProps & BoxProps>`
  ${(props) => props.transparent && TransparentBox}
  ${(props) => props.outlined && Outline}
  ${(props) => props.purple && 'background-color: rgba(250, 0, 255, 0.3);'}
  ${() => handleGenericProps()}
`

const BoxBase = styled(RebassBox)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
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
`

const TransparentBox = css`
  background-color: rgba(0, 0, 0, 0);
`

const Outline = css`
  border-width: 1px;
  border-style: solid;
  border-color: rgb(255, 255, 255);
`

export const Box = styled(BoxRow)<BoxProps & GenericProps>`
  ${BoxPropsHandler}
  align-items: center;
  border-radius: 10px;
  ${(props) => !props.purple && !props.transparent && 'background-color: rgba(0, 255, 209, 0.3);'}
  ${(props) =>
    props.p !== undefined ||
    props.pt !== undefined ||
    props.pl !== undefined ||
    props.pr !== undefined ||
    props.pb !== undefined
      ? null
      : `padding: 24px;`}
`

export const SmallBox = styled.div<BoxProps & GenericProps>`
  ${BoxPropsHandler}
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
`

export const BoxItem = styled.div`
  margin: 0 auto;
`

export const BoxItemTitle = styled.div<TextProps>`
  ${() => handleTextProps()}
  margin-bottom: 4px;
`

export const BoxItemValue = styled.div<TextProps>`
  ${() => handleTextProps()}
`

export const BoxItemUnits = styled.span<TextProps>`
  ${() => handleTextProps()}
`
