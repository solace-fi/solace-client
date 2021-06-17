import React from 'react'
import styled, { css } from 'styled-components'

export interface TextProps {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  t1?: boolean
  t2?: boolean
  t3?: boolean
  textAlignCenter?: boolean
  textAlignLeft?: boolean
  textAlignRight?: boolean
  outlined?: boolean
}

const OutlinedCss = css`
  height: 30px;
  line-height: 30px;
  text-align: center;
  padding: 2px 16px;
  margin: 0 10px 0 10px;
  border: 1px solid #fff;
  border-radius: 10px;
  white-space: nowrap;
`

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

export const Text1 = styled.div<TextProps>`
  ${Text1Css}
  ${() => handleTextProps()}
`

export const Text2 = styled.div<TextProps>`
  ${Text2Css}
  ${() => handleTextProps()}
`

export const Text3 = styled.div<TextProps>`
  ${Text3Css}
  ${() => handleTextProps()}
`

export const Heading1 = styled.div<TextProps>`
  ${Heading1Css}
  ${() => handleTextProps()}
`

export const Heading2 = styled.div<TextProps>`
  ${Heading2Css}
  ${() => handleTextProps()}
`

export const Heading3 = styled.div<TextProps>`
  ${Heading3Css}
  ${() => handleTextProps()}
`

export const handleTextProps = (): any => {
  return css<TextProps>`
    ${(props) => props.h1 && Heading1Css}
    ${(props) => props.h2 && Heading2Css}
    ${(props) => props.h3 && Heading3Css}
    ${(props) => props.t1 && Text1Css}
    ${(props) => props.t2 && Text2Css}
    ${(props) => props.t3 && Text3Css}
    ${(props) => props.textAlignCenter && AlignCenterCss}
    ${(props) => props.textAlignLeft && AlignLeftCss}
    ${(props) => props.textAlignRight && AlignRightCss}
    ${(props) => props.outlined && OutlinedCss}
  `
}
