/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components

    Quote
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { MultiStepForm } from './MultiStepForm'
import { Text } from '../../components/atoms/Typography'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { HeroContainer } from '../../components/atoms/Layout'

function Quote(): any {
  /*************************************************************************************
    
  hooks

  *************************************************************************************/
  const { isActive, account } = useWallet()

  return !isActive || !account ? (
    <HeroContainer>
      <Text bold t1 textAlignCenter>
        Please connect your wallet to buy coverage
      </Text>
      <WalletConnectButton info />
    </HeroContainer>
  ) : (
    <MultiStepForm />
  )
}

export default Quote
