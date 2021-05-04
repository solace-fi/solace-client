import React from 'react'
import styled, { css } from 'styled-components'

export interface TextProps {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  text?: boolean
}

const TextCss = css`
  font-size: 14px;
`

const HeadingCss = css`
  font-weight: bold;
  line-height: 1.4;
`

const Heading1Css = css`
  ${HeadingCss}
  margin: 20px 0;
  font-size: 24px;
`
const Heading2Css = css`
  ${HeadingCss}
  font-size: 20px;
`

const Heading3Css = css`
  ${HeadingCss}
  margin: 0;
  ${TextCss}
`
export const Text = styled.div`
  ${TextCss}
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

export const handleTextProps = (props: TextProps): any => {
  if (props.h1) return Heading1Css
  if (props.h2) return Heading2Css
  if (props.h3) return Heading3Css
  if (props.text) return Text
}
