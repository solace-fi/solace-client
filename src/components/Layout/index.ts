import { MAX_WIDTH } from '../../constants/'
import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
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

export const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 30px;

  @media screen and (max-width: 1160px) {
    padding: 90px 0 0 0;
  }
`

export const LayoutContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  max-width: ${MAX_WIDTH}px;

  @media screen and (max-width: 1160px) {
    justify-content: center;
  }
`

interface LayoutContentProps {
  width?: number
}

export const NavContent = styled.div<LayoutContentProps>`
  padding: 20px;
  align-content: start;
  ${(props) => props.width && `min-width: ${(props.width / 100) * MAX_WIDTH}px;`}

  @media screen and (max-width: 1160px) {
    display: none;
  }
`

export const LayoutContent = styled.div<LayoutContentProps>`
  padding: 20px;
  align-content: start;
  ${(props) => props.width && `min-width: ${(props.width / 100) * MAX_WIDTH}px;`}
`

export const Content = styled.div`
  padding: 30px 0;
`
