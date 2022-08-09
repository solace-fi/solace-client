/*************************************************************************************

    Table of Contents:

    import packages
    import components
    import resources

    Logo
      Render

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { LogoBase } from '../atoms/Logo'
import { GeneralElementProps } from '../generalInterfaces'

/* import resources */
import coloredLogo from '../../resources/svg/solace-logo-color.svg'
import whiteLogo from '../../resources/svg/solace-logo-white.svg'
import coloredCircle from '../../resources/svg/solace-circle-color.svg'
import whiteCircle from '../../resources/svg/solace-circle-white.svg'
import { MARKETING_SITE } from '../../constants'

interface LogoProps {
  location: any
}

export const Logo: React.FC<GeneralElementProps & LogoProps> = ({ ...props }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <LogoBase {...props}>
      <img
        src={props.location.pathname !== '/' ? coloredLogo : whiteLogo}
        alt="Solace | Decentralized Coverage Protocol"
      />
    </LogoBase>
  )
}

export const MiniLogo: React.FC<GeneralElementProps & LogoProps & { style?: React.CSSProperties }> = ({ ...props }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <LogoBase {...props} width={40}>
      <img
        src={props.location.pathname !== '/' ? coloredCircle : whiteCircle}
        alt="Solace | Decentralized Coverage Protocol"
      />
    </LogoBase>
  )
}
