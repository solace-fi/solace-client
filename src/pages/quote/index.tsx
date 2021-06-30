/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components

    Quote function
      Hook variables
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import styled from 'styled-components'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { MultiStepForm } from './MultiStepForm'
import { Heading1 } from '../../components/Text'
import { WalletConnectButton } from '../../components/Button/WalletConnect'
import { HeroContainer } from '../../components/Layout'

function Quote(): any {
  const wallet = useWallet()

  return !wallet.isActive || !wallet.account ? (
    <HeroContainer>
      <Heading1>Please connect your wallet to buy quotes</Heading1>
      <WalletConnectButton />
    </HeroContainer>
  ) : (
    <MultiStepForm />
  )
}

export default Quote
