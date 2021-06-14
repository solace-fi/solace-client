import React from 'react'
import { useWallet } from '../../context/WalletManager'
import { MultiStepForm } from './MultiStepForm'

function Quote(): any {
  const wallet = useWallet()

  return !wallet.isActive ? <div>Please connect your wallet</div> : <MultiStepForm />
}

export default Quote
