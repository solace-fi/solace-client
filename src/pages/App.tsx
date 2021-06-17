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
import { Route, Switch, useLocation } from 'react-router-dom'

/* import pages */
import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'
import Govern from './govern'

/* import components */
import { SideNavbar, Navbar } from '../components/Navbar/Navbar'
import { PageHeader } from '../components/Header/Prices'
import { GlobalStyle, Layout, LayoutContainer, LayoutContent, NavContent } from '../components/Layout'
import { LayoutContentWithLoader } from '../components/Layout/LayoutContentWithLoader'
import { Statistics } from '../components/Box/Statistics'

export default function App(): any {
  const location = useLocation()

  return (
    <Fragment>
      <GlobalStyle />
      <Navbar />
      <Layout>
        <LayoutContainer>
          <NavContent width={10}>
            <SideNavbar />
          </NavContent>
          <LayoutContent>
            <PageHeader />
            <LayoutContentWithLoader>
              {location.pathname !== '/quote' && <Statistics />}
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
