import {
  MAX_NAVBAR_SCREEN_WIDTH,
  MAX_WIDTH,
  MAX_TABLET_SCREEN_WIDTH,
  MOBILE_SCREEN_MARGIN,
  MAX_MOBILE_SCREEN_WIDTH,
} from '../../../constants'
import styled, { createGlobalStyle, keyframes } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps } from '../../generalInterfaces'
import { Text3Css } from '../Typography'

interface ScrollableProps {
  maxDesktopHeight?: number
  maxMobileHeight?: number
}

export const Scrollable = styled.div<ScrollableProps>`
  max-height: ${(props) => (props.maxDesktopHeight ? props.maxDesktopHeight : `60`)}vh;
  overflow-y: auto;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    max-height: ${(props) => (props.maxMobileHeight ? props.maxMobileHeight : `75`)}vh;
  }
`

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

export const GlobalStyle = createGlobalStyle`
  body{
    margin: 0;
    font-family: 'PT Sans',Arial,sans-serif;
    line-height: 1.4;
    color: ${({ theme }) => theme.typography.med_emphasis};
    background: ${({ theme }) => theme.body.bg_color};
    background-attachment: fixed;
    background-size: 120% 120%;
    animation: ${movingGradient} 30s ease infinite;
    ${Text3Css}
  }
`

export const FlexRow = styled.div<GeneralElementProps>`
  display: flex;
  flex-direction: row;
  ${GeneralElementCss}
`

export const FlexCol = styled.div<GeneralElementProps>`
  display: flex;
  flex-direction: column;
  ${GeneralElementCss}
`

export const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 30px;

  @media screen and (max-width: ${MAX_NAVBAR_SCREEN_WIDTH}px) {
    padding: 90px 0 60px 0;
  }
`

export const ContentContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  max-width: ${MAX_WIDTH}px;

  @media screen and (max-width: ${MAX_NAVBAR_SCREEN_WIDTH}px) {
    justify-content: center;
  }
`
export const SideNavContent = styled.div<HeightAndWidthProps>`
  padding: 20px;
  align-content: start;
  min-width: ${(props) => ((props.width ? props.width : 10) / 100) * MAX_WIDTH}px;

  @media screen and (max-width: ${MAX_NAVBAR_SCREEN_WIDTH}px) {
    display: none;
  }
`

export const LayoutContent = styled.div<HeightAndWidthProps>`
  align-content: start;
  ${(props) => (props.width ? `width: ${(props.width / 100) * MAX_WIDTH}px;` : 'width: 100%;')}
  padding: 20px;

  @media screen and (max-width: ${MAX_TABLET_SCREEN_WIDTH}px) {
    padding: 0px;
  }
`

export const HeroContainer = styled(FlexCol)<HeightAndWidthProps>`
  align-items: center;
  justify-content: center;
  height: ${(props) => (props.height ? props.height : '400')}px;
`

export const FooterComponent = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.92);
  text-align: center;
  overflow: hidden;
  display: block;
  z-index: 1;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    padding: 10px 0;
  }
`

export const Content = styled.div`
  padding: 15px 0;

  @media screen and (max-width: ${MAX_TABLET_SCREEN_WIDTH}px) {
    padding: 30px ${MOBILE_SCREEN_MARGIN}px;
  }
`
