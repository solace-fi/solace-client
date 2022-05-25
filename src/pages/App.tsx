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
import Invest from './invest'
import Stake from './stake'
import Bond from './bond'
import Govern from './govern'
import Terms from './terms'

/* import components */
import { MenusTopNavBar } from '../components/organisms/MenusTopNavbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent, Flex } from '../components/atoms/Layout'
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
import { BKPT_2, BKPT_NAVBAR, MARKETING_SITE } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/internal/useWindowDimensions'

import { AnalyticsReporter } from '../analytics'
import Soteria from './soteria'
import { PageInfo } from '../constants/types'
import Archive from './archive'
import { AppMenu } from '../components/organisms/RightNavbar'
import { InfoSideNavbar, MobileInfoSideNavbar } from '../components/organisms/LeftNavbar'
import { AppMenuHeader } from '../components/organisms/AppMenuHeader'
import { useGeneral } from '../context/GeneralManager'
import Cover from './cover'

export default function App(): any {
  const { leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar } = useGeneral()
  const location = useLocation()
  const { width } = useWindowDimensions()

  const pages: PageInfo[] = [
    {
      name: 'My Coverage',
      title: 'My Policy',
      to: '/cover',
      icon: <StyledDashboard size={30} />,
      component: Soteria,
    },
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
        { pageName: 'Coverage', to: `${MARKETING_SITE}/about/cover` },
        { pageName: 'Staking', to: `${MARKETING_SITE}/about/staking` },
        { pageName: 'Bonding', to: `${MARKETING_SITE}/about/tokenomics` },
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
        { pageName: 'Roadmap', to: `${MARKETING_SITE}/#roadmap` },
        { pageName: 'Investors', to: `${MARKETING_SITE}/#investors` },
        { pageName: 'Advisors', to: `${MARKETING_SITE}/#advisors` },
        { pageName: 'Core Contributors', to: `${MARKETING_SITE}/#coreContributors` },
      ],
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <MenusTopNavBar setShowLeft={setLeftSidebar} setShowRight={setRightSidebar} />
      <InfoSideNavbar show={width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR)} tabs={tabs} />
      <AppMenu show={rightSidebar} setShow={setRightSidebar} />
      <Layout>
        <ContentContainer>
          <SideNavContent mobileWidth={6}></SideNavContent>
          <MobileInfoSideNavbar
            show={leftSidebar && width < (rightSidebar ? BKPT_2 : BKPT_NAVBAR)}
            setShow={setLeftSidebar}
            tabs={tabs}
          />
          <LayoutContent>
            {width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR) && (
              <AppMenuHeader pages={pages} setShow={setRightSidebar} />
            )}
            <Flex>
              <div style={{ transition: '350ms', width: rightSidebar ? 'calc(100% - 375px)' : '100%' }}>
                {/* {location.pathname !== '/quote' && location.pathname !== '/terms' && location.pathname !== '/' && (
                <Statistics />
              )} */}
                <Switch>
                  <Route
                    exact
                    path="/"
                    component={() => {
                      window.location.href = MARKETING_SITE
                      return null
                    }}
                  />
                  {pages.map((p) => (
                    <Route exact key={p.to} path={p.to} component={p.component} />
                  ))}
                  <Route exact path="/terms" component={Terms} />
                  <Route exact path="/swc3" component={Cover} />
                </Switch>
              </div>
              <SideNavContent desktopWidth={8}></SideNavContent>
            </Flex>
          </LayoutContent>
        </ContentContainer>
      </Layout>
    </Fragment>
  )
}
