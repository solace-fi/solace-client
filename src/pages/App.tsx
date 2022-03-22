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
import React, { Fragment, useState } from 'react'
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
import { MenusTopNavBar } from '../components/organisms/MenusTopNavbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent } from '../components/atoms/Layout'
import { LayoutContentWithLoader } from '../components/molecules/LayoutContentWithLoader'
import { Statistics } from '../components/organisms/Statistics'
import {
  StyledDashboard,
  StyledCoinStack,
  StyledCommunity,
  StyledReceiptMoney,
  StyledFolderHistory,
  StyledTractor,
} from '../components/atoms/Icon'

/* import constants */
import { BKPT_5, BKPT_NAVBAR } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/internal/useWindowDimensions'

import { AnalyticsReporter } from '../analytics'
import Soteria from './soteria'
import { PageInfo } from '../constants/types'
import Archive from './archive'
import { AppMenu } from '../components/organisms/AppMenu'
import { InfoSideNavbar, MobileInfoSideNavbar } from '../components/organisms/AppInfoNavbar'
import { AppMenuHeader } from '../components/organisms/AppMenuHeader'

export default function App(): any {
  const location = useLocation()
  const { width } = useWindowDimensions()

  const [rightSidebar, setRightSidebar] = useState(false)
  const [leftSidebar, setLeftSidebar] = useState(false)

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
    {
      name: 'Archive',
      to: '/archive',
      icon: <StyledFolderHistory size={30} />,
      component: Archive,
    },
  ]

  const tabs = [
    {
      collapsibleName: 'Products',
      pages: [
        { pageName: 'Coverage', to: '/' },
        { pageName: 'Staking', to: '/' },
        { pageName: 'Bonding', to: '/' },
      ],
    },
    {
      collapsibleName: 'Developers',
      pages: [
        { pageName: 'Docs', to: 'https://docs.solace.fi/' },
        { pageName: 'SDK', to: '/' },
      ],
    },
    {
      collapsibleName: 'About',
      pages: [
        { pageName: 'Roadmap', to: '/' },
        { pageName: 'Investors', to: '/' },
        { pageName: 'Advisors', to: '/' },
        { pageName: 'Core Contributors', to: '/' },
      ],
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      {/* <TopNavbar pages={pages} /> */}
      <MenusTopNavBar setShowLeft={setLeftSidebar} setShowRight={setRightSidebar} />
      <AppMenu show={rightSidebar} setShow={setRightSidebar} />
      <Layout>
        <ContentContainer>
          <SideNavContent mobileWidth={6}>
            {/* <SideNavbar pages={pages} /> */}
            <InfoSideNavbar tabs={tabs} />
          </SideNavContent>
          <MobileInfoSideNavbar show={leftSidebar && width < BKPT_NAVBAR} setShow={setLeftSidebar} tabs={tabs} />
          <LayoutContent>
            {width >= BKPT_NAVBAR && <AppMenuHeader setShow={setRightSidebar} />}
            <LayoutContentWithLoader>
              {location.pathname !== '/quote' && location.pathname !== '/terms' && location.pathname !== '/' && (
                <Statistics />
              )}
              <Switch>
                <Route exact path="/" component={About} />
                {pages.map((p) => (
                  <Route exact key={p.to} path={p.to} component={p.component} />
                ))}
                <Route exact path="/terms" component={Terms} />
              </Switch>
            </LayoutContentWithLoader>
          </LayoutContent>
        </ContentContainer>
      </Layout>
    </Fragment>
  )
}
