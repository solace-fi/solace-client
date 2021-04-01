import React, { useEffect } from 'react'
import { ethers } from 'ethers'
import { Web3ReactProvider } from '@web3-react/core'

import getLibrary from '../utils/getLibrary'

// const Web3ProviderNetwork = createWeb3ReactRoot()
const PRIVATE_KEY_TEST_NEVER_USE = '0xad20c82497421e9784f18460ad2fe84f73569068e98e270b3e63743268af5763'

function App() {
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider()
    // const signer = provider.getSigner()
    const wallet = new ethers.Wallet(PRIVATE_KEY_TEST_NEVER_USE, provider)
    provider.listAccounts().then((result) => {
      console.log(result[0])
    })

    const balancePromise = wallet.getBalance()
    balancePromise.then((balance) => {
      console.log(balance)
    })
  }, [])

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="App">hi</div>
    </Web3ReactProvider>
  )
}

export default App
