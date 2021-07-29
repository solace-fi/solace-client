import React from 'react'
import logo from '../../static/solace.png'
import { LogoBase } from '.'

export const Logo: React.FC = () => {
  return (
    <LogoBase>
      <img src={logo} alt="Solace" />
    </LogoBase>
  )
}
