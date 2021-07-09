import styled, { css } from 'styled-components'

export interface TextFontProps {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  t1?: boolean
  t2?: boolean
  t3?: boolean
}

export interface TextAlignProps {
  textAlignCenter?: boolean
  textAlignLeft?: boolean
  textAlignRight?: boolean
}

export interface TextStyleProps {
  nowrap?: boolean
  outlined?: boolean
  alignVertical?: boolean
  bold?: boolean
  error?: boolean
  warning?: boolean
}

export interface GeneralTextProps extends TextFontProps, TextAlignProps, TextStyleProps {}

const Font1 = css`
  font-size: 24px;
`

const Font2 = css`
  font-size: 20px;
`

const Font3 = css`
  font-size: 14px;
`

const HeadingCss = css`
  font-weight: bold;
  line-height: 1.4;
`

const Heading1Css = css`
  ${HeadingCss}
  ${Font1}
  margin: 20px 0;
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

const Text1Css = css`
  ${Font1}
`

const Text2Css = css`
  ${Font2}
`

const Text3Css = css`
  ${Font3}
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

const AlignVerticalCss = css`
  height: 30px;
  line-height: 30px;
`

const AlignVerticalAutoCss = css`
  ${AlignVerticalCss}
  margin: auto;
`

const TextOutlineCss = css`
  padding: 2px 16px;
  margin: 0 5px 0 5px;
  border: 1px solid #fff;
  border-radius: 10px;
  ${AlignVerticalCss}
`

const NoWrapCss = css`
  white-space: nowrap;
`

export const TextFontCss = css<TextFontProps>`
  ${(props) => props.h1 && Heading1Css}
  ${(props) => props.h2 && Heading2Css}
  ${(props) => props.h3 && Heading3Css}
  ${(props) => props.t1 && Text1Css}
  ${(props) => props.t2 && Text2Css}
  ${(props) => props.t3 && Text3Css}
`

export const TextAlignCss = css<TextAlignProps>`
  ${(props) => props.textAlignCenter && AlignCenterCss}
  ${(props) => props.textAlignLeft && AlignLeftCss}
  ${(props) => props.textAlignRight && AlignRightCss}
`

export const TextStyleCss = css<TextStyleProps>`
  ${(props) => props.nowrap && NoWrapCss}
  ${(props) => props.outlined && TextOutlineCss}
  ${(props) => props.alignVertical && AlignVerticalAutoCss}
  ${(props) => props.bold && 'font-weight: 600;'}
  ${(props) => props.error && 'color: rgba(219, 44, 56);'}
  ${(props) => props.warning && 'color: rgba(254, 249, 154);'}
`

export const GeneralTextCss = css<GeneralTextProps>`
  ${TextFontCss}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
`

export const Text1 = styled.div<GeneralTextProps>`
  ${Text1Css}
  ${GeneralTextCss}
`

export const Text2 = styled.div<GeneralTextProps>`
  ${Text2Css}
  ${GeneralTextCss}
`

export const Text3 = styled.div<GeneralTextProps>`
  ${Text3Css}
  ${GeneralTextCss}
`

export const Heading1 = styled.div<GeneralTextProps>`
  ${Heading1Css}
  ${GeneralTextCss}
`

export const Heading2 = styled.div<GeneralTextProps>`
  ${Heading2Css}
  ${GeneralTextCss}
`

export const Heading3 = styled.div<GeneralTextProps>`
  ${Heading3Css}
  ${GeneralTextCss}
`
