import React, { Suspense, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { ethers } from 'ethers'

import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import Header from '../components/Header'
import Loading from '../components/Loader'

// const Web3ProviderNetwork = createWeb3ReactRoot()
const PRIVATE_KEY_TEST_NEVER_USE = '0xad20c82497421e9784f18460ad2fe84f73569068e98e270b3e63743268af5763'

export default function App(): any {
  useEffect(() => {
    const metamask = (window as any).ethereum
    const provider = new ethers.providers.Web3Provider(metamask)
    // const signer = provider.getSigner()
    const wallet = new ethers.Wallet(PRIVATE_KEY_TEST_NEVER_USE, provider)
    wallet.connect(provider)
    provider.listAccounts().then((result) => {
      console.log(result[0])
    })

    const balancePromise = wallet.getBalance()
    balancePromise.then((balance) => {
      console.log(balance)
    })
  }, [])

  return (
    <Suspense fallback={<Loading />}>
      <Header />
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/invest" component={Invest} />
        <Route exact path="/quote" component={Quote} />
      </Switch>
    </Suspense>
  )
}
