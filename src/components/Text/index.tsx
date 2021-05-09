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
}

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

export const Text1 = styled.div`
  ${Text1Css}
`

export const Text2 = styled.div`
  ${Text2Css}
`

export const Text3 = styled.div`
  ${Text3Css}
`

export const Heading1 = styled.div`
  ${Heading1Css}
`

export const Heading2 = styled.div`
  ${Heading2Css}
`

export const Heading3 = styled.div`
  ${Heading3Css}
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
  `
}
