/*************************************************************************************

    Table of Contents:

    import react
    import components
    import static

    Logo function
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import components */
import { LogoBase } from '../atoms/Logo'

/* import static */
import logo from '../../static/solace.png'

export const Logo: React.FC = () => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <LogoBase href={`https://solace.fi/`} target="_blank" rel="noopener noreferrer">
      <img src={logo} alt="Solace" />
    </LogoBase>
  )
}
