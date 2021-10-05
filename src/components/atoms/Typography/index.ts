import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../../constants'

export interface TextFontProps {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  h4?: boolean

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

export interface TextStyleProps {
  nowrap?: boolean
  outlined?: boolean
  autoAlignVertical?: boolean
  autoAlignHorizontal?: boolean
  autoAlign?: boolean
  bold?: boolean
  success?: boolean
  error?: boolean
  warning?: boolean
  high_em?: boolean
  med_em?: boolean
  low_em?: boolean
}

export interface GeneralTextProps extends TextFontProps, TextAlignProps, TextStyleProps {}

const Font1 = css`
  font-size: 24px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    font-size: 22px;
  }
`

const Font2 = css`
  font-size: 20px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    font-size: 18px;
  }
`

const Font3 = css`
  font-size: 16px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    font-size: 14px;
  }
`

const Font4 = css`
  font-size: 14px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    font-size: 12px;
  }
`

const HeadingCss = css`
  font-weight: bold;
  line-height: 1.4;
`

const Heading1Css = css`
  ${HeadingCss}
  ${Font1}
  margin: 20px 0;
  color: ${({ theme }) => theme.typography.high_emphasis};
`
const Heading2Css = css`
  ${HeadingCss}
  ${Font2}
`

const Heading3Css = css`
  ${HeadingCss}
  ${Font3}
  margin: 0;
`

const Heading4Css = css`
  ${HeadingCss}
  ${Font4}
  margin: 0;
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
  ${(props) => props.h1 && Heading1Css}
  ${(props) => props.h2 && Heading2Css}
  ${(props) => props.h3 && Heading3Css}
  ${(props) => props.h4 && Heading4Css}
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
  ${(props) => props.outlined && TextOutlineCss}
  ${(props) => props.autoAlign && AlignAutoCss}
  ${(props) => props.autoAlignVertical && AlignVerticalCss}
  ${(props) => props.autoAlignHorizontal && AlignHorizontalCss}
  ${(props) => props.bold && 'font-weight: 600;'}

  ${(props) => props.low_em && `color: ${props.theme.typography.low_emphasis};`}
  ${(props) => props.med_em && `color: ${props.theme.typography.med_emphasis};`}
  ${(props) => props.high_em && `color: ${props.theme.typography.high_emphasis};`}

  ${(props) => props.success && `color: ${props.theme.typography.success};`}
  ${(props) => props.error && `color: ${props.theme.typography.error};`}
  ${(props) => props.warning && `color: ${props.theme.typography.warning};`}
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

export const Text1 = styled.div<TextAlignProps & TextStyleProps>`
  ${Text1Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text2 = styled.div<TextAlignProps & TextStyleProps>`
  ${Text2Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text3 = styled.div<TextAlignProps & TextStyleProps>`
  ${Text3Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text4 = styled.div<TextAlignProps & TextStyleProps>`
  ${Text4Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Heading1 = styled.div<TextAlignProps & TextStyleProps>`
  ${Heading1Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Heading2 = styled.div<TextAlignProps & TextStyleProps>`
  ${Heading2Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Heading3 = styled.div<TextAlignProps & TextStyleProps>`
  ${Heading3Css}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Heading4 = styled.div<TextAlignProps & TextStyleProps>`
  ${Heading4Css}
  ${TextAlignCss}
  ${TextStyleCss}
`
