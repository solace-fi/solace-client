/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import pages
    import components

    App function

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { Route, Switch } from 'react-router-dom'

/* import pages */
import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'
import Govern from './govern'

/* import components */
import Navbar from '../components/Sidebar/Navbar'
import Prices from '../components/Header/Prices'
import { GlobalStyle, Layout, LayoutContainer, LayoutContent } from '../components/Layout'
import { LayoutContentWithLoader } from '../components/Layout/LayoutContentWithLoader'
import { Statistics } from '../components/Box/Statistics'

export default function App(): any {
  return (
    <Fragment>
      <GlobalStyle />
      <Layout>
        <LayoutContainer>
          <LayoutContent width={10}>
            <Navbar />
          </LayoutContent>
          <LayoutContent width={90}>
            <Prices />
            <LayoutContentWithLoader>
              <Statistics />
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/invest" component={Invest} />
                <Route exact path="/quote" component={Quote} />
                <Route exact path="/govern" component={Govern} />
              </Switch>
            </LayoutContentWithLoader>
          </LayoutContent>
        </LayoutContainer>
      </Layout>
    </Fragment>
  )
}
