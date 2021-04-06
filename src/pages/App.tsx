import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import Web3ReactManager from '../context/Web3ReactManager'

// import Header from '../components/Header'
// import Loading from '../components/Loader'

export default function App(): any {
  return (
    // <Suspense fallback={<Loading />}>
    //   <Header />
    <Web3ReactManager>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/invest" component={Invest} />
        <Route exact path="/quote" component={Quote} />
      </Switch>
    </Web3ReactManager>
  )
}
