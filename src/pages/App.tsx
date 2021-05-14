import React, { Fragment, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'

import Dashboard from './dashboard'
import Invest from './invest'
import Quote from './quote'

import { Statistics } from '../components/Box/Statistics'
import Navbar from '../components/Sidebar/Navbar'
import Prices from '../components/Header/Prices'
import styled, { createGlobalStyle } from 'styled-components'

import { Loader } from '../components/Loader'
import { useWallet } from '../context/Web3Manager'
import Govern from './govern'

import ReactNotification, { store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css'

const MAX_WIDTH = 1340

const GlobalStyle = createGlobalStyle`
  body{
    margin: 0;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    line-height: 1.4;
    color: #fff;
    background: linear-gradient(113.7deg, #b621ff 0%, #21d3fc 100%);
    background-attachment: fixed;
  }
`

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 30px;
`

const LayoutContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  max-width: ${MAX_WIDTH}px;
`

interface LayoutContentProps {
  width?: number
}

const LayoutContent = styled.div<LayoutContentProps>`
  padding: 20px;
  align-content: start;
  ${(props) => props.width && `min-width: ${(props.width / 100) * MAX_WIDTH}px;`}
`

export const Content = styled.div`
  padding: 30px 0;
`

export const LayoutContentWithLoader: React.FC = ({ children }) => {
  const { initialized } = useWallet()
  const [loader, setLoader] = useState<boolean>(false)

  useEffect(() => {
    setLoader(initialized)
  }, [initialized])
  return <Fragment>{loader ? children : <Loader />}</Fragment>
}

export const makeNotification = (condition: string) => {
  switch (condition) {
    case 'success':
      store.addNotification({
        message: 'Transaction successful',
        type: 'success',
        insert: 'top',
        container: 'bottom-right',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      })
      break
    case 'failure':
      store.addNotification({
        message: 'Transaction failed',
        type: 'danger',
        insert: 'top',
        container: 'bottom-right',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      })
      break
    default:
      store.addNotification({
        message: 'Transaction pending...',
        type: 'info',
        insert: 'top',
        container: 'bottom-right',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      })
  }
}

export default function App(): any {
  return (
    <Fragment>
      <GlobalStyle />
      <ReactNotification />
      <Layout>
        <LayoutContainer>
          <LayoutContent width={10}>
            <Navbar />
          </LayoutContent>
          <LayoutContent>
            <Prices />
            <LayoutContentWithLoader>
              <Statistics />
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/invest" component={Invest} />
                <Route exact path="/quote" component={Quote} />
                <Route exact path="/govern" component={Govern} />
              </Switch>
            </LayoutContentWithLoader>
          </LayoutContent>
        </LayoutContainer>
      </Layout>
    </Fragment>
  )
}
