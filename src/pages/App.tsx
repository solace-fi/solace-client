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
import { AppMenu } from '../components/organisms/RightNavbar'
import { InfoSideNavbar, MobileInfoSideNavbar } from '../components/organisms/LeftNavbar'
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
      title: 'My Policy',
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
      title: 'My Bonding',
      to: '/bond',
      icon: <StyledReceiptMoney size={30} />,
      component: Bond,
    },
    {
      name: 'Stake',
      title: 'My Staking',
      to: '/stake',
      icon: <StyledCoinStack size={30} />,
      component: Stake,
    },
    {
      name: 'Farms',
      title: 'My Farming',
      to: '/farms',
      icon: <StyledTractor size={30} />,
      component: Invest,
    },
    {
      name: 'Govern',
      title: 'Governance',
      to: '/govern',
      icon: <StyledCommunity size={30} />,
      component: Govern,
    },
    {
      name: 'Archive',
      title: 'Archived Features',
      to: '/archive',
      icon: <StyledFolderHistory size={30} />,
      component: Archive,
    },
  ]

  const tabs = [
    {
      collapsibleName: 'Products',
      pages: [
        { pageName: 'Coverage', to: 'https://solace.fi/about/cover' },
        { pageName: 'Staking', to: 'https://solace.fi/about/staking' },
        { pageName: 'Bonding', to: 'https://solace.fi/about/tokenomics' },
      ],
    },
    {
      collapsibleName: 'Governance',
      pages: [
        {
          pageName: 'Token',
          to: 'https://etherscan.io/token/0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
          newTab: true,
        },
        { pageName: 'DAO', to: 'https://forum.solace.fi/', newTab: true },
      ],
    },
    {
      collapsibleName: 'Developers',
      pages: [
        { pageName: 'Docs', to: 'https://docs.solace.fi/', newTab: true },
        { pageName: 'SDK', to: 'https://docs.solace.fi/docs/dev-docs/sdk/getting-started', newTab: true },
      ],
    },
    {
      collapsibleName: 'About',
      pages: [
        { pageName: 'Roadmap', to: 'https://solace.fi/#roadmap' },
        { pageName: 'Investors', to: 'https://solace.fi/#investors' },
        { pageName: 'Advisors', to: 'https://solace.fi/#advisors' },
        { pageName: 'Core Contributors', to: 'https://solace.fi/#coreContributors' },
      ],
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <MenusTopNavBar setShowLeft={setLeftSidebar} setShowRight={setRightSidebar} />
      <AppMenu show={rightSidebar} setShow={setRightSidebar} />
      <Layout>
        <ContentContainer>
          <SideNavContent mobileWidth={6}>
            <InfoSideNavbar tabs={tabs} />
          </SideNavContent>
          <MobileInfoSideNavbar show={leftSidebar && width < BKPT_NAVBAR} setShow={setLeftSidebar} tabs={tabs} />
          <LayoutContent>
            {width >= BKPT_NAVBAR && <AppMenuHeader pages={pages} setShow={setRightSidebar} />}
            <LayoutContentWithLoader>
              {/* {location.pathname !== '/quote' && location.pathname !== '/terms' && location.pathname !== '/' && (
                <Statistics />
              )} */}
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
