import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { BKPT_3 } from '../../../constants'

export interface TextFontProps {
  t1?: boolean
  t2?: boolean
  t3?: boolean
  t4?: boolean
}

export interface TextAlignProps {
  textAlignCenter?: boolean
  textAlignLeft?: boolean
  textAlignRight?: boolean
}

export interface TextStyleProps extends GeneralElementProps {
  nowrap?: boolean
  mont?: boolean
  lineHeight?: number
  analogical?: boolean
  light?: boolean
  dark?: boolean
  outlined?: boolean
  autoAlignVertical?: boolean
  autoAlignHorizontal?: boolean
  autoAlign?: boolean
  bold?: boolean
  info?: boolean
  success?: boolean
  error?: boolean
  warning?: boolean
  fade?: boolean
}

export interface GeneralTextProps extends TextFontProps, TextAlignProps, TextStyleProps {}

const Font1 = css`
  font-size: 24px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 22px;
  }
`

const Font2 = css`
  font-size: 20px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 18px;
  }
`

const Font3 = css`
  font-size: 16px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 14px;
  }
`

const Font4 = css`
  font-size: 14px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 12px;
  }
`

const AlignCenterCss = css`
  text-align: center;
`

const AlignLeftCss = css`
  text-align: left;
`

const AlignRightCss = css`
  text-align: right;
`

const AlignHeightCss = css`
  height: 30px;
  line-height: 30px;
`

const AlignVerticalCss = css`
  margin-top: auto;
  margin-bottom: auto;
`

const AlignHorizontalCss = css`
  margin-left: auto;
  margin-right: auto;
`

const AlignAutoCss = css`
  ${AlignHeightCss}
  ${AlignHorizontalCss}
  ${AlignVerticalCss}
`

const TextOutlineCss = css`
  padding: 2px 16px;
  margin: 0 5px 0 5px;
  border: 1px solid #fff;
  border-radius: 10px;
  ${AlignHeightCss}
`

const NoWrapCss = css`
  white-space: nowrap;
`

export const Text1Css = css`
  ${Font1}
`

export const Text2Css = css`
  ${Font2}
`

export const Text3Css = css`
  ${Font3}
`

export const Text4Css = css`
  ${Font4}
`

export const TextFontCss = css<TextFontProps>`
  ${Text3Css}
  ${(props) => props.t1 && Text1Css}
  ${(props) => props.t2 && Text2Css}
  ${(props) => props.t3 && Text3Css}
  ${(props) => props.t4 && Text4Css}
`

export const TextAlignCss = css<TextAlignProps>`
  ${(props) => props.textAlignCenter && AlignCenterCss}
  ${(props) => props.textAlignLeft && AlignLeftCss}
  ${(props) => props.textAlignRight && AlignRightCss}
`

export const TextStyleCss = css<TextStyleProps>`
  ${(props) => props.nowrap && NoWrapCss}
  ${(props) => props.mont && `font-family: 'Montserrat', sans-serif;`}
  ${(props) => props.outlined && TextOutlineCss}
  ${(props) => props.autoAlign && AlignAutoCss}
  ${(props) => props.autoAlignVertical && AlignVerticalCss}
  ${(props) => props.autoAlignHorizontal && AlignHorizontalCss}
  ${(props) => props.bold && 'font-weight: 600;'}
  ${(props) => props.lineHeight && `line-height: ${props.lineHeight};`}

  ${(props) =>
    props.analogical
      ? `color: ${props.theme.typography.analogicalText};`
      : `color: ${props.theme.typography.contrastText};`}
  ${(props) => props.info && `color: ${props.theme.typography.infoText};`}
  ${(props) => props.success && `color: ${props.theme.typography.successText};`}
  ${(props) => props.error && `color: ${props.theme.typography.errorText};`}
  ${(props) => props.warning && `color: ${props.theme.typography.warningText};`}
  ${(props) => props.light && `color: ${props.theme.typography.lightText};`}
  ${(props) => props.dark && `color: ${props.theme.typography.darkText};`}
  ${(props) => props.fade && `opacity: 0.5;`}

  ${GeneralElementCss}
`

export const GeneralTextCss = css<GeneralTextProps>`
  ${TextFontCss}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text = styled.div<GeneralTextProps & GeneralElementProps>`
  ${GeneralTextCss}
  ${GeneralElementCss}
`

export const TextSpan = styled.span<GeneralTextProps & GeneralElementProps>`
  ${GeneralTextCss}
  ${GeneralElementCss}
`
