/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import pages
    import components
    import constants
    import hooks

    App

  *************************************************************************************/

/* import packages */
import React, { Fragment } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'

import '../index.css'
/* import managers */

/* import pages */
import About from './about'
import Dashboard from './dashboard'
import Invest from './invest'
import Stake from './stake'
import Bond from './bond'
import Quote from './quote'
import Govern from './govern'
import Terms from './terms'

/* import components */
import { SideNavbar, TopNavbar } from '../components/organisms/Navbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent } from '../components/atoms/Layout'
import { LayoutContentWithLoader } from '../components/molecules/LayoutContentWithLoader'
import { Statistics } from '../components/organisms/Statistics'

/* import constants */
import { BKPT_5 } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/useWindowDimensions'

import { AnalyticsReporter } from '../analytics'

export default function App(): any {
  const location = useLocation()
  const { width } = useWindowDimensions()

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <TopNavbar />
      <div>
        <Layout>
          <ContentContainer>
            <SideNavContent>
              <SideNavbar />
            </SideNavContent>
            <LayoutContent>
              <LayoutContentWithLoader>
                {location.pathname !== '/quote' && location.pathname !== '/terms' && location.pathname !== '/' && (
                  <Statistics />
                )}
                <Switch>
                  <Route exact path="/" component={About} />
                  <Route exact path="/dashboard" component={Dashboard} />
                  <Route exact path="/invest" component={Invest} />
                  <Route exact path="/stake" component={Stake} />
                  <Route exact path="/bond" component={Bond} />
                  <Route exact path="/quote" component={Quote} />
                  <Route exact path="/govern" component={Govern} />
                  <Route exact path="/terms" component={Terms} />
                </Switch>
              </LayoutContentWithLoader>
            </LayoutContent>
            {location.pathname == '/' && width > BKPT_5 && <SideNavContent />}
          </ContentContainer>
        </Layout>
      </div>
    </Fragment>
  )
}
