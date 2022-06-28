import React from 'react'
import { css } from 'styled-components'

export interface ReactProps {
  style?: React.CSSProperties
}

export interface HeightAndWidthProps {
  width?: number
  height?: number
  widthP?: number
  heightP?: number
}

export interface PaddingProps {
  p?: number
  pt?: number
  pl?: number
  pr?: number
  pb?: number
  px?: number
  py?: number
}

export interface MarginProps {
  m?: number
  mt?: number
  ml?: number
  mr?: number
  mb?: number
  mx?: number
  my?: number
}

export interface ChildrenPositioningProps {
  jc?: string
}

export const HeightAndWidthCss = css<HeightAndWidthProps>`
  ${(props) => props.width != undefined && `width: ${props.width}px;`}
  ${(props) => props.height != undefined && `height: ${props.height}px;`}
  ${(props) => props.widthP != undefined && `width: ${props.widthP}%;`}
  ${(props) => props.heightP != undefined && `height: ${props.heightP}%;`}
`

export const PaddingCss = css<PaddingProps>`
  ${(props) => props.p != undefined && `padding: ${props.p}px;`}
  ${(props) => props.pt != undefined && `padding-top: ${props.pt}px;`}
  ${(props) => props.pl != undefined && `padding-left: ${props.pl}px;`}
  ${(props) => props.pr != undefined && `padding-right: ${props.pr}px;`}
  ${(props) => props.pb != undefined && `padding-bottom: ${props.pb}px;`}
  ${(props) => props.px !== undefined && `padding-left: ${props.px}px; padding-right: ${props.px}px;`}
  ${(props) => props.py !== undefined && `padding-top: ${props.py}px; padding-bottom: ${props.py}px;`}
`

export const MarginCss = css<MarginProps>`
  ${(props) => props.m != undefined && `margin: ${props.m}px;`}
  ${(props) => props.mt != undefined && `margin-top: ${props.mt}px;`}
  ${(props) => props.ml != undefined && `margin-left: ${props.ml}px;`}
  ${(props) => props.mr != undefined && `margin-right: ${props.mr}px;`}
  ${(props) => props.mb != undefined && `margin-bottom: ${props.mb}px;`}
  ${(props) => props.mx !== undefined && `margin-left: ${props.mx}px; margin-right: ${props.mx}px;`}
  ${(props) => props.my !== undefined && `margin-top: ${props.my}px; margin-bottom: ${props.my}px;`}
`

export const ChildrenPositioningCss = css<ChildrenPositioningProps>`
  ${(props) => props.jc != undefined && `justify-content: ${props.jc};`}
`

export interface GeneralElementProps
  extends ReactProps,
    HeightAndWidthProps,
    PaddingProps,
    MarginProps,
    ChildrenPositioningProps {}

export const GeneralElementCss = css<GeneralElementProps>`
  ${HeightAndWidthCss}
  ${PaddingCss}
  ${MarginCss}
  ${ChildrenPositioningCss}
`
