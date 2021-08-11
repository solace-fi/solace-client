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

import { GeneralElementProps } from '../generalInterfaces'

export const Logo: React.FC<GeneralElementProps> = ({ ...props }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <LogoBase href={`https://solace.fi/`} target="_blank" rel="noopener noreferrer" {...props}>
      <img src={logo} alt="Solace" />
    </LogoBase>
  )
}
