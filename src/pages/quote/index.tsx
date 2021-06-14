import React from 'react'
import styled from 'styled-components'
import { useWallet } from '../../context/WalletManager'
import { MultiStepForm } from './MultiStepForm'
import { Heading1 } from '../../components/Text'
import { WalletConnectButton } from '../../components/Button/WalletConnect'

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
