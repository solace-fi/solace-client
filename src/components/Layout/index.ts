import { MAX_WIDTH } from '../../constants/'
import styled, { createGlobalStyle } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps } from '../generalInterfaces'

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
`

export const LayoutContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
  max-width: ${MAX_WIDTH}px;
`

export const LayoutContent = styled.div<HeightAndWidthProps>`
  padding: 20px;
  align-content: start;
  ${(props) => (props.width ? `width: ${(props.width / 100) * MAX_WIDTH}px;` : 'width: 100%;')}
`

export const HeroContainer = styled(FlexCol)<HeightAndWidthProps>`
  align-items: center;
  justify-content: center;
  height: ${(props) => (props.height ? props.height : '400')}px;
`

export const Content = styled.div`
  padding: 30px 0;
`
