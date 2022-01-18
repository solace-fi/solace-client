import styled from 'styled-components'

const Separator = styled.div`
  /* border-color: ${({ theme }) => theme.v2.separator};
  border-style: solid;
  border-left-width: 1px; */
  width: 1px;
  background-color: ${({ theme }) => theme.v2.separator};
`

export const DarkSeparator = styled(Separator)`
  background-color: #000;
`
export default Separator
