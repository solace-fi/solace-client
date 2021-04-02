import React, { Suspense, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'

import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import ContractABI from '../constants/abis/Contract'

import Header from '../components/Header'
import Loading from '../components/Loader'

import getWeb3 from '../utils/getWeb3'

export default function App(): any {
  useEffect(() => {
    async function fetchWeb3() {
      const web3: any = await getWeb3()

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts()

      // Get the contract instance.
      const networkId = await web3.eth.net.getId()

      const deployedNetwork = ContractABI.networks[networkId]
      // const contractInstance = new web3.eth.Contract(ContractABI, deployedNetwork && deployedNetwork.address)
    }

    fetchWeb3()
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
