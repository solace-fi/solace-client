import styled, { css } from 'styled-components'

export default styled.div<{
  between?: boolean
  // center?: boolean
  justifyCenter?: boolean
  itemsCenter?: boolean
  center?: boolean
  column?: boolean
  col?: boolean
  end?: boolean
  stretch?: boolean
  wrap?: boolean
  mb?: number
  mt?: number
  p?: number
  pb?: number
  pl?: number
  pr?: number
  pt?: number
  gap?: number
  w?: number
  hidden?: boolean
  baseline?: boolean
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
  margin-bottom: ${({ mb }) => mb + 'px'};
  margin-top: ${({ mt }) => mt + 'px'};
  padding: ${({ p }) => p}px;
  padding-bottom: ${({ pb }) => pb}px;
  padding-left: ${({ pl }) => pl}px;
  padding-right: ${({ pr }) => pr}px;
  padding-top: ${({ pt }) => pt}px;
  gap: ${({ gap }) => gap}px;
  width: ${({ w }) => w}px;
  ${({ hidden }) => hidden && 'display: none;'}
`
