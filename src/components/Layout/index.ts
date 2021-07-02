import { MAX_WIDTH } from '../../constants/'
import styled, { createGlobalStyle } from 'styled-components'
import { GenericProps, handleGenericProps } from '../interfaces'

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

export const FlexRow = styled.div<GenericProps>`
  display: flex;
  flex-direction: row;
  ${() => handleGenericProps()}
`

export const FlexCol = styled.div<GenericProps>`
  display: flex;
  flex-direction: column;
  ${() => handleGenericProps()}
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

interface LayoutContentProps {
  width?: number
}

export const LayoutContent = styled.div<LayoutContentProps>`
  padding: 20px;
  align-content: start;
  ${(props) => (props.width ? `min-width: ${(props.width / 100) * MAX_WIDTH}px;` : 'width: 100%;')}
`

export const HeroContainer = styled(FlexCol)`
  align-items: center;
  justify-content: center;
  min-height: 400px;
`

export const Content = styled.div`
  padding: 30px 0;
`
