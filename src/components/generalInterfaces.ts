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
}

export interface MarginProps {
  m?: number
  mt?: number
  ml?: number
  mr?: number
  mb?: number
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
`

export const MarginCss = css<MarginProps>`
  ${(props) => props.m != undefined && `margin: ${props.m}px;`}
  ${(props) => props.mt != undefined && `margin-top: ${props.mt}px;`}
  ${(props) => props.ml != undefined && `margin-left: ${props.ml}px;`}
  ${(props) => props.mr != undefined && `margin-right: ${props.mr}px;`}
  ${(props) => props.mb != undefined && `margin-bottom: ${props.mb}px;`}
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
