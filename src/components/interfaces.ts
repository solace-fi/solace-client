import { css } from 'styled-components'

export interface GenericProps {
  p?: number
  pt?: number
  pl?: number
  pr?: number
  pb?: number
  m?: number
  mt?: number
  ml?: number
  mr?: number
  mb?: number
  width?: number
  height?: number
}

export const handleGenericProps = () => {
  return css<GenericProps>`
    ${(props) => props.p != undefined && `padding: ${props.p}px;`}
    ${(props) => props.pt != undefined && `padding-top: ${props.pt}px;`}
    ${(props) => props.pl != undefined && `padding-left: ${props.pl}px;`}
    ${(props) => props.pr != undefined && `padding-right: ${props.pr}px;`}
    ${(props) => props.pb != undefined && `padding-bottom: ${props.pb}px;`}
    ${(props) => props.m != undefined && `margin: ${props.m}px;`}
    ${(props) => props.mt != undefined && `margin-top: ${props.mt}px;`}
    ${(props) => props.ml != undefined && `margin-left: ${props.ml}px;`}
    ${(props) => props.mr != undefined && `margin-right: ${props.mr}px;`}
    ${(props) => props.mb != undefined && `margin-bottom: ${props.mb}px;`}
    ${(props) => props.width != undefined && `width: ${props.width}px;`}
    ${(props) => props.height != undefined && `height: ${props.height}px;`}
  `
}
