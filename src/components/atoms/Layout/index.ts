import { MAX_NAVBAR_SCREEN_WIDTH, MAX_WIDTH, MAX_MOBILE_SCREEN_WIDTH, MOBILE_SCREEN_MARGIN } from '../../../constants'
import styled, { createGlobalStyle, css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps } from '../../generalInterfaces'
import { GlobalFont } from '../Typography'

export const CustomScrollbar = css`
  ::-webkit-scrollbar {
    width: 10px;
  }
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 60px rgba(6, 119, 145, 0.5);
  }
  ::-webkit-scrollbar-thumb {
    background-color: #fff;
    background-image: -webkit-gradient(linear, 40% 0%, 75% 84%, from(#b621ff), to(#b621ff), color-stop(0.6, #f1d6ff));
  }
`

export const GlobalStyle = createGlobalStyle`
  body{
    margin: 0;
    font-family: 'Open Sans', sans-serif;
    line-height: 1.4;
    color: #fff;
    background: linear-gradient(113.7deg, #b621ff 0%, #21d3fc 100%);
    background-attachment: fixed;
    ${CustomScrollbar}
    ${GlobalFont}
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

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    padding: 0px;
  }
`

export const HeroContainer = styled(FlexCol)<HeightAndWidthProps>`
  align-items: center;
  justify-content: center;
  height: ${(props) => (props.height ? props.height : '400')}px;
`

export const Footer = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  text-align: center;
  display: none;
  overflow: hidden;
  padding: 10px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    display: block;
    width: 100%;
    z-index: 1;
  }
`

export const Content = styled.div`
  padding: 30px 0;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    padding: 30px ${MOBILE_SCREEN_MARGIN}px;
  }
`
