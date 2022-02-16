import { BKPT_5 } from '../../../constants'
import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps, HeightAndWidthCss } from '../../generalInterfaces'

export const Flex = styled.div<{
  between?: boolean
  around?: boolean
  // center?: boolean
  justifyCenter?: boolean
  itemsCenter?: boolean
  center?: boolean
  column?: boolean
  col?: boolean
  justifyEnd?: boolean
  stretch?: boolean
  wrap?: boolean
  m?: number
  mb?: number
  mt?: number
  ml?: number
  mr?: number
  p?: number
  pb?: number
  pl?: number
  pr?: number
  pt?: number
  gap?: number
  w?: number
  hidden?: boolean
  baseline?: boolean
  flex1?: boolean
}>`
  display: flex;
  justify-content: 'flex-start';
  ${({ justifyCenter }) =>
    justifyCenter &&
    css`
      justify-content: center;
    `}
  ${({ between }) =>
    between &&
    css`
      justify-content: space-between;
    `}
    ${({ around }) =>
    around &&
    css`
      justify-content: space-around;
    `}
  ${({ itemsCenter }) =>
    itemsCenter &&
    css`
      align-items: center;
    `}
  ${({ center }) =>
    center &&
    css`
      justify-content: center;
      align-items: center;
    `}
  ${({ stretch }) =>
    stretch &&
    css`
      align-items: stretch;
    `}
    ${({ baseline }) =>
    baseline &&
    css`
      align-items: baseline;
    `}
  flex-direction: ${({ column, col }) => (column || col ? 'column' : 'row')};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  ${({ m }) =>
    m &&
    css`
      margin: ${m}px;
    `}
  margin-bottom: ${({ mb }) => mb + 'px'};
  margin-top: ${({ mt }) => mt + 'px'};
  margin-left: ${({ ml }) => ml + 'px'};
  margin-right: ${({ mr }) => mr + 'px'};
  padding: ${({ p }) => p}px;
  padding-bottom: ${({ pb }) => pb}px;
  padding-left: ${({ pl }) => pl}px;
  padding-right: ${({ pr }) => pr}px;
  padding-top: ${({ pt }) => pt}px;
  gap: ${({ gap }) => gap}px;
  width: ${({ w }) => w}px;
  ${({ hidden }) => hidden && 'display: none;'}
  ${({ justifyEnd }) => justifyEnd && 'justify-content: flex-end;'}
  ${({ flex1 }) => flex1 && 'flex: 1;'}
`

export const HeroContainer = styled.div<HeightAndWidthProps & GeneralElementProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  ${HeightAndWidthCss}
  ${GeneralElementCss}
`

export const Content = styled.div<GeneralElementProps>`
  padding: 20px 0;

  @media screen and (max-width: ${BKPT_5}px) {
    padding: 30px 20px;
  }
  ${GeneralElementCss}
`
