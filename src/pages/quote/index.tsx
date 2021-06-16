/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    styled components

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

/************************************************************************************* 

    styled components 

  *************************************************************************************/
export const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`

function Quote(): any {
  const wallet = useWallet()

  return !wallet.isActive || !wallet.account ? (
    <WelcomeContainer>
      <Heading1>Please connect your wallet to buy quotes</Heading1>
      <WalletConnectButton />
    </WelcomeContainer>
  ) : (
    <MultiStepForm />
  )
}

export default Quote
