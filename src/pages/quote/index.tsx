/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components

    Quote function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { MultiStepForm } from './MultiStepForm'
import { Heading1 } from '../../components/atoms/Typography'
import { WalletConnectButton } from '../../components/molecules/WalletConnect'
import { HeroContainer } from '../../components/atoms/Layout'

function Quote(): any {
  /*************************************************************************************
    
  custom hooks

  *************************************************************************************/
  const { isActive, account } = useWallet()

  /************************************************************************************** 
      
  Render

  *************************************************************************************/

  return !isActive || !account ? (
    <HeroContainer>
      <Heading1 textAlignCenter>Please connect your wallet to buy quotes</Heading1>
      <WalletConnectButton />
    </HeroContainer>
  ) : (
    <MultiStepForm />
  )
}

export default Quote
