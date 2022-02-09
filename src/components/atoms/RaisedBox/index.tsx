// 24-padding white box with 10px radius corner and shadow
import styled from 'styled-components'

export default styled.div<{
  flex?: boolean
}>`
  background-color: ${({ theme }) => theme.v2.raised};
  border-radius: 10px;
  flex: 1;
  // padding: 24px;
  ${({ flex }) => flex && 'display: flex;'}
`
