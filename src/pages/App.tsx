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
import { SideNavbar, TopNavbar } from '../components/organisms/Navbar'
import { BottomPrices, PageHeader } from '../components/organisms/Header'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent } from '../components/atoms/Layout'
import { LayoutContentWithLoader } from '../components/molecules/LayoutContentWithLoader'
import { Statistics } from '../components/organisms/Statistics'

export default function App(): any {
  const location = useLocation()

  return (
    <Fragment>
      <GlobalStyle />
      <TopNavbar />
      <BottomPrices />
      <Layout>
        <ContentContainer>
          <SideNavContent>
            <SideNavbar />
          </SideNavContent>
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
        </ContentContainer>
      </Layout>
    </Fragment>
  )
}
