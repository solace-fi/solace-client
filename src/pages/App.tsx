import React, { Suspense, Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'

import Playground from './playground'
import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import Navbar from '../components/ui/Navbar'
// import Loading from '../components/Loader'

export default function App(): any {
  return (
    // <Suspense fallback={<Loading />}>
    <Fragment>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Playground} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/invest" component={Invest} />
        <Route exact path="/quote" component={Quote} />
      </Switch>
    </Fragment>
  )
}
