import styled from 'styled-components'

export default styled.div<{
  between?: boolean
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
}>`
  display: flex;
  justify-content: ${({ between, end, center }) =>
    between ? 'space-between' : end ? 'flex-end' : center ? 'center' : 'flex-start'};
  align-items: ${({ center, stretch }) => (center ? 'center' : stretch ? 'stretch' : 'flex-start')};
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
`
