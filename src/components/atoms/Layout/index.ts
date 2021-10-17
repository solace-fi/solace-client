import { BKPT_NAVBAR, MAX_WIDTH, BKPT_5, BKPT_3 } from '../../../constants'
import styled, { createGlobalStyle, keyframes } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps, HeightAndWidthCss } from '../../generalInterfaces'
import { Text3Css } from '../Typography'
import gradientBackground from '../../../resources/svg/solace-gradient-background.svg'

interface ScrollableProps {
  maxDesktopHeight?: number
  maxMobileHeight?: number
}

interface LayoutProps {
  location: any
}

export const Scrollable = styled.div<ScrollableProps>`
  max-height: ${(props) => (props.maxDesktopHeight ? props.maxDesktopHeight : `60`)}vh;
  overflow-y: auto;
  padding: 10px;
  background-color: ${(props) => props.theme.accordion.bg_color};

  @media screen and (max-width: ${BKPT_3}px) {
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

export const GlobalStyle = createGlobalStyle<LayoutProps>`
  body{
    margin: 0;
    font-family: 'Open Sans', sans-serif;
    line-height: 1.4;
    color: ${({ theme }) => `${theme.typography.contrastText}`};
    background: ${({ theme }) => theme.body.bg_color};
    ${(props) => props.location.pathname == '/' && `background: url(${gradientBackground});`}
    background-attachment: fixed;
    background-size: cover;
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

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    padding: 90px 0 60px 0;
  }
`

export const HorizRule = styled.hr<LayoutProps>`
  ${(props) => props.location.pathname == '/' && `color: ${props.theme.typography.lightText} !important;`}
`

export const ContentContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  max-width: ${MAX_WIDTH}px;

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    justify-content: center;
  }
`
export const SideNavContent = styled.div<HeightAndWidthProps>`
  padding: 20px;
  align-content: start;
  min-width: ${(props) => ((props.width ? props.width : 12) / 100) * MAX_WIDTH}px;

  @media screen and (max-width: ${BKPT_3}px) {
    min-width: ${(props) => ((props.width ? props.width : 4) / 100) * MAX_WIDTH}px;
  }

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    display: none;
  }
`

export const LayoutContent = styled.div<HeightAndWidthProps>`
  align-content: start;
  ${(props) => (props.width ? `width: ${(props.width / 100) * MAX_WIDTH}px;` : 'width: 100%;')}
  padding: 20px;

  @media screen and (max-width: ${BKPT_5}px) {
    padding: 0px;
  }
`

export const HeroContainer = styled(FlexCol)<HeightAndWidthProps>`
  align-items: center;
  justify-content: center;
  height: 400px;
  ${HeightAndWidthCss}
`

export const Content = styled.div`
  padding: 20px 0;

  @media screen and (max-width: ${BKPT_5}px) {
    padding: 30px 20px;
  }
`
