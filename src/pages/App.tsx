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
import {
  StyledDashboard,
  StyledCoinStack,
  StyledCommunity,
  StyledReceiptMoney,
  StyledFileShield,
  StyledTractor,
} from '../components/atoms/Icon'

/* import constants */
import { BKPT_5 } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/useWindowDimensions'

import { AnalyticsReporter } from '../analytics'
import Soteria from './soteria'
import { PageInfo } from '../constants/types'

export default function App(): any {
  const location = useLocation()
  const { width } = useWindowDimensions()

  const pages: PageInfo[] = [
    // {
    //   name: 'Dashboard',
    //   to: '/dashboard',
    //   icon: <StyledDashboard size={30} />,
    //   component: Dashboard,
    // },
    {
      name: 'My Coverage',
      to: '/cover',
      icon: <StyledDashboard size={30} />,
      component: Soteria,
    },
    // {
    //   name: 'Buy Cover',
    //   to: '/quote',
    //   icon: <StyledFileShield size={30} />,
    //   component: Quote,
    // },
    {
      name: 'Bond',
      to: '/bond',
      icon: <StyledReceiptMoney size={30} />,
      component: Bond,
    },
    {
      name: 'Stake',
      to: '/stake',
      icon: <StyledCoinStack size={30} />,
      component: Stake,
    },
    {
      name: 'Farms',
      to: '/farms',
      icon: <StyledTractor size={30} />,
      component: Invest,
    },
    {
      name: 'Govern',
      to: '/govern',
      icon: <StyledCommunity size={30} />,
      component: Govern,
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <TopNavbar pages={pages} />
      <Layout>
        <ContentContainer>
          <SideNavContent>
            <SideNavbar pages={pages} />
          </SideNavContent>
          <LayoutContent>
            <LayoutContentWithLoader>
              {location.pathname !== '/quote' && location.pathname !== '/terms' && location.pathname !== '/' && (
                <Statistics />
              )}
              <Switch>
                <Route exact path="/" component={About} />
                {/* <Route exact path="/dashboard" component={Dashboard} />
                <Route exact path="/invest" component={Invest} />
                <Route exact path="/stake" component={Stake} />
                <Route exact path="/cover" component={Soteria} />
                <Route exact path="/bond" component={Bond} />
                <Route exact path="/quote" component={Quote} />
                <Route exact path="/govern" component={Govern} /> */}
                {pages.map((p) => (
                  <Route exact key={p.to} path={p.to} component={p.component} />
                ))}
                <Route exact path="/terms" component={Terms} />
              </Switch>
            </LayoutContentWithLoader>
          </LayoutContent>
          {location.pathname == '/' && width > BKPT_5 && <SideNavContent />}
        </ContentContainer>
      </Layout>
    </Fragment>
  )
}
