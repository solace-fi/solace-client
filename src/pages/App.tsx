import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

// import Header from '../components/Header'
// import Loading from '../components/Loader'

export default function App(): any {
  return (
    // <Suspense fallback={<Loading />}>
    //   <Header />
    <Switch>
      <Route exact path="/" component={Dashboard} />
      <Route exact path="/invest" component={Invest} />
      <Route exact path="/quote" component={Quote} />
    </Switch>
  )
}
