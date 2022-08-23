import { BKPT_NAVBAR, MAX_WIDTH, BKPT_5, BKPT_3, Z_FOOTER } from '../../../constants'
import styled, { createGlobalStyle, keyframes } from 'styled-components'
import { HeightAndWidthProps } from '../../generalInterfaces'
import { Text3Css } from '../Typography'
import { LayoutProps } from '.'

const movingGradient = keyframes`
0% {
  background-position: 0% 50%;
}
50% {
  background-position: 100% 50%;
}
100% {
  background-position: 0% 50%;
}
`

export const GlobalStyle = createGlobalStyle<LayoutProps>`
  body{
    margin: 0;
    font-family: 'Open Sans', sans-serif;
    line-height: 1.4;
    color: ${({ theme }) => `${theme.typography.secondary}`};
    background: ${({ theme }) => theme.body.layout_bg_color};
    ${(props) =>
      props.location.pathname == '/' &&
      `background: radial-gradient(ellipse 120% 150% at 60% 0,
      rgba(212,120,216,1) 10%,
      rgba(212,120,216,0) 50%),
  radial-gradient(ellipse 50% 150% at 40% 150%,
      rgba(243,211,126,1) 20%,
      rgba(243,211,126,0) 80%),
  radial-gradient(ellipse 50% 200% at 100% 50%,
      rgba(95,93,249,1) 10%,
      rgba(95,93,249,0) 90%),
  radial-gradient(ellipse 100% 200% at 0 100%,
      rgba(240,77,66,1) 10%,
      rgba(240,77,66,0) 100%);`}
    background-attachment: fixed;
    background-size: cover;
    animation: ${movingGradient} 30s ease infinite;
    ${Text3Css}
  }
`

export const Layout = styled.div`
  display: flex;
  /* min-height: 100vh; */
  padding: 30px;

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    padding: 60px 0 60px 0;
  }
`

export const ContentContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  /* max-width: ${MAX_WIDTH}px; */

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    justify-content: center;
  }
`

interface SideNavbarProps {
  desktopWidth?: number
  mobileWidth?: number
}

export const SideNavContent = styled.div<SideNavbarProps>`
  align-content: start;
  min-width: ${(props) => ((props.desktopWidth ? props.desktopWidth : 12) / 100) * MAX_WIDTH}px;

  @media screen and (max-width: ${BKPT_3}px) {
    min-width: ${(props) => ((props.mobileWidth ? props.mobileWidth : 4) / 100) * MAX_WIDTH}px;
  }

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    display: none;
  }
`

export const LayoutContent = styled.div<HeightAndWidthProps>`
  align-content: start;
  ${(props) => (props.width ? `width: ${(props.width / 100) * MAX_WIDTH}px;` : 'width: 100%;')}

  @media screen and (max-width: ${BKPT_5}px) {
    padding: 0px;
  }
`

export const Footer = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  text-align: center;
  display: block;
  overflow: hidden;
  padding: 10px 0;
  z-index: ${Z_FOOTER};
`
