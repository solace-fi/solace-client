import styled from 'styled-components'

export const RaisedBox = styled.div<{
  flex?: boolean
}>`
  background-color: ${({ theme }) => theme.v2.raised};
  border-radius: 10px;
  flex: 1;
  ${({ flex }) => flex && 'display: flex;'}
`
