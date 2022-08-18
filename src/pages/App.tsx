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
import Stake from './stake'
import Bond from './bond'
import Govern from './govern'
import Terms from './terms'

/* import components */
import { MenusTopNavBar } from '../components/organisms/MenusTopNavbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent, Flex } from '../components/atoms/Layout'
// import { Statistics } from '../components/organisms/Statistics'
import { StyledDashboard, StyledCoinStack, StyledCommunity, StyledReceiptMoney } from '../components/atoms/Icon'

/* import constants */
import { BKPT_2, BKPT_NAVBAR } from '../constants'

/* import hooks */
import { useWindowDimensions } from '../hooks/internal/useWindowDimensions'

import { AnalyticsReporter } from '../analytics'
import { PageInfo } from '../constants/types'
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
      component: Cover,
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
      name: 'Govern',
      title: 'Governance',
      to: '/govern',
      icon: <StyledCommunity size={30} />,
      component: Govern,
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <MenusTopNavBar setShowLeft={setLeftSidebar} setShowRight={setRightSidebar} />
      <InfoSideNavbar show={width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR)} />
      <AppMenu show={rightSidebar} setShow={setRightSidebar} />
      <Layout>
        <ContentContainer>
          <SideNavContent mobileWidth={6}></SideNavContent>
          <MobileInfoSideNavbar
            show={leftSidebar && width < (rightSidebar ? BKPT_2 : BKPT_NAVBAR)}
            setShow={setLeftSidebar}
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
                      window.location.href = `${(window as any).location.href}cover`
                      return null
                    }}
                  />
                  <Route
                    exact
                    path="/farms"
                    component={() => {
                      window.location.href = 'https://legacy.solace.fi/farms'
                      return null
                    }}
                  />
                  <Route
                    exact
                    path="/archive"
                    component={() => {
                      window.location.href = 'https://legacy.solace.fi/archive'
                      return null
                    }}
                  />
                  {pages.map((p) => (
                    <Route exact key={p.to} path={p.to} component={p.component} />
                  ))}
                  <Route exact path="/terms" component={Terms} />
                  <Route
                    exact
                    path="*"
                    component={() => (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 'calc(100vh - 130px)',
                          width: '100%',
                          fontSize: '2rem',
                          // fontFamily: 'Montserrat',
                          fontWeight: 'bold',
                        }}
                      >
                        404 Not Found
                      </div>
                    )}
                  />
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
