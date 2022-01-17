// 24-padding white box with 10px radius corner and shadow
import styled from 'styled-components'

export default styled.div`
  background-color: ${({ theme }) => theme.v2.raised};
  border-radius: 10px;
  padding: 24px;
`
