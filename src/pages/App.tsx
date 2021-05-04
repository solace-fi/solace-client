import React, { Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'

import Playground from './playground'
import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import Nav from '../components/ui/Sidebar/Nav'
import Prices from '../components/ui/Header/Prices'
import styled, { createGlobalStyle } from 'styled-components'

import logo from '../static/solace.png'

const GlobalStyle = createGlobalStyle`
  body{
    margin: 0;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    line-height: 1.4;
    color: #fff;
    background: linear-gradient(113.7deg, #b621ff 0%, #21d3fc 100%);
  }
`

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 30px;
`

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr;
  gap: 50px 24px;
  margin: 0 auto;
  width: 100%;
  max-width: 1340px;
`

const LayoutLogo = styled.a`
  grid-column: 1/2;
  grid-row: 1/2;
  display: flex;
  align-items: flex-start;
  width: 114px;
  text-decoration: none;
  img {
    max-width: 100%;
  }
`

const LayoutContent = styled.div`
  display: grid;
  align-content: start;
  gap: 50px;
`

export default function App(): any {
  return (
    <Fragment>
      <GlobalStyle />
      <Layout>
        <LayoutContainer>
          <LayoutLogo>
            <img src={logo} alt="Solace" />
          </LayoutLogo>
          <Prices />
          <Nav />
          <LayoutContent>
            <Switch>
              <Route exact path="/" component={Playground} />
              <Route exact path="/dashboard" component={Dashboard} />
              <Route exact path="/invest" component={Invest} />
              <Route exact path="/quote" component={Quote} />
            </Switch>
          </LayoutContent>
        </LayoutContainer>
      </Layout>
    </Fragment>
  )
}
