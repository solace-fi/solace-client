/*************************************************************************************

    Table of Contents:

    import react
    import components
    import resources

    Logo function
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import components */
import { LogoBase } from '../atoms/Logo'
import { GeneralElementProps } from '../generalInterfaces'

/* import resources */
import coloredLogo from '../../resources/svg/solace-logo-color.svg'
import whiteLogo from '../../resources/svg/solace-logo-white.svg'
import { StyledNavLink } from '../atoms/Link'

interface LogoProps {
  location: any
}

export const Logo: React.FC<GeneralElementProps & LogoProps> = ({ ...props }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <StyledNavLink to="/">
      <LogoBase {...props}>
        <img
          src={props.location.pathname !== '/' ? coloredLogo : whiteLogo}
          alt="Solace | Decentralized Coverage Protocol"
        />
      </LogoBase>
    </StyledNavLink>
  )
}
