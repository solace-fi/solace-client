import styled from 'styled-components'

export const WhiteCircle = styled.div<{
  size?: number
}>`
  /* border is 100% #fafafa 4px */
  border: 4px solid #fafafa;
  border-radius: 50%;
  height: ${(props) => (props.size ?? 20) - 8}px;
  width: ${(props) => (props.size ?? 20) - 8}px;
`
