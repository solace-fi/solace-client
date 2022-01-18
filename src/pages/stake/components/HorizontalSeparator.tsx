import React from 'react'
import styled from 'styled-components'

// import Separator from './Twiv'

const Separator = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.v2.separator};
`

export default Separator
