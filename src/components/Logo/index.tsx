import React from 'react'
import styled from 'styled-components'

import logo from '../../static/solace.png'

const LogoBase = styled.a`
  display: flex;
  align-items: flex-start;
  width: 114px;
  text-decoration: none;
  img {
    max-width: 100%;
  }
`

export const Logo: React.FC = () => {
  return (
    <LogoBase>
      <img src={logo} alt="Solace" />
    </LogoBase>
  )
}
