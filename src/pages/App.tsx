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
import Lock from './lock'
import Gauge from './vote'
import Analytics from './analytics'
/* import components */
import { MenusTopNavBar } from '../components/organisms/MenusTopNavbar'
import { GlobalStyle, Layout, ContentContainer, LayoutContent, SideNavContent, Flex } from '../components/atoms/Layout'
// import { Statistics } from '../components/organisms/Statistics'

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
import Bribe from './bribe'

export default function App(): any {
  const { leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar } = useGeneral()
  const location = useLocation()
  const { width } = useWindowDimensions()

  const pages: PageInfo[] = [
    {
      name: 'Vote',
      title: 'My Voting',
      to: '/vote',
      component: Gauge,
    },
    {
      name: 'Lock',
      title: 'My Locking',
      to: '/lock',
      component: Lock,
    },
    {
      name: 'Bribe',
      title: 'Native Bribes',
      to: '/bribe',
      component: Bribe,
    },
    {
      name: 'Analytics',
      title: 'Native Analytics',
      to: '/analytics',
      component: Analytics,
    },
  ]

  return (
    <Fragment>
      <AnalyticsReporter />
      <GlobalStyle location={location} />
      <MenusTopNavBar setShowLeft={setLeftSidebar} setShowRight={setRightSidebar} />
      <InfoSideNavbar pages={pages} show={width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR)} />
      <AppMenu show={rightSidebar} setShow={setRightSidebar} />
      <Layout>
        <ContentContainer>
          <SideNavContent mobileWidth={6}></SideNavContent>
          <MobileInfoSideNavbar
            pages={pages}
            show={leftSidebar && width < (rightSidebar ? BKPT_2 : BKPT_NAVBAR)}
            setShow={setLeftSidebar}
          />
          <LayoutContent>
            {width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR) && (
              <AppMenuHeader pages={pages} setShow={setRightSidebar} />
            )}
            <Flex>
              <div style={{ transition: '350ms', width: rightSidebar ? 'calc(100% - 375px)' : '100%' }}>
                <Switch>
                  <Route
                    exact
                    path="/"
                    component={() => {
                      window.location.href = `${(window as any).location.href}vote`
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
