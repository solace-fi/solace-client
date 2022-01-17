import React from 'react'
import styled from 'styled-components'

// import Separator from './Twiv'

const Separator = styled.div`
  border-color: ${({ theme }) => theme.v2.separator};
  border-style: solid;
  border-left-width: 1px;
`

// const VerticalSeparator = () => <Separator />

// border-[#E3E4E6]`}></Twiv>
export default Separator
