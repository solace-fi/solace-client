/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import pages
    import components
    import constants
    import hooks

    App

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { Route, Switch, useLocation } from 'react-router-dom'

/* import managers */

/* import pages */
import About from './about'
import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'
import Govern from './govern'

/* import components */
import { SideNavbar, TopNavbar } from '../components/organisms/Navbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent } from '../components/atoms/Layout'
import { LayoutContentWithLoader } from '../components/molecules/LayoutContentWithLoader'
import { Statistics } from '../components/organisms/Statistics'

/* import constants */
import { BKPT_5 } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/useWindowDimensions'

export default function App(): any {
  const location = useLocation()
  const { width } = useWindowDimensions()

  return (
    <Fragment>
      <GlobalStyle location={location} />
      <TopNavbar />
      <Layout>
        <ContentContainer>
          <SideNavContent>
            <SideNavbar />
          </SideNavContent>
          <LayoutContent>
            <LayoutContentWithLoader>
              {location.pathname !== '/quote' && location.pathname !== '/' && <Statistics />}
              <Switch>
                <Route exact path="/" component={About} />
                <Route exact path="/dashboard" component={Dashboard} />
                <Route exact path="/invest" component={Invest} />
                <Route exact path="/quote" component={Quote} />
                <Route exact path="/govern" component={Govern} />
              </Switch>
            </LayoutContentWithLoader>
          </LayoutContent>
          {location.pathname == '/' && width > BKPT_5 && <SideNavContent />}
        </ContentContainer>
      </Layout>
    </Fragment>
  )
}
