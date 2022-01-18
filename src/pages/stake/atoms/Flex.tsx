import styled from 'styled-components'

export default styled.div<{
  between?: boolean
  center?: boolean
  column?: boolean
  end?: boolean
  stretch?: boolean
  wrap?: boolean
  mb?: number
  p?: number
  gap?: number
}>`
  display: flex;
  justify-content: ${({ between, end, center }) =>
    between ? 'space-between' : end ? 'flex-end' : center ? 'center' : 'flex-start'};
  align-items: ${({ center, stretch }) => (center ? 'center' : stretch ? 'stretch' : 'flex-start')};
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  margin-bottom: ${({ mb }) => mb + 'px'};
  padding: ${({ p }) => p}px;
  gap: ${({ gap }) => gap}px;
`
