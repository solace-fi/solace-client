import styled, { keyframes } from 'styled-components'
import { HeightAndWidthProps } from '../../generalInterfaces'

interface LoaderProps {
  isLight?: boolean
}

export const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }`

export const Loader = styled.div<LoaderProps & HeightAndWidthProps>`
  width: ${(props) => (props.width ? `${props.width + 20}px` : '80px')};
  height: ${(props) => (props.height ? `${props.height + 20}px` : '80px')};
  margin: auto;
  &:after {
    content: ' ';
    display: block;
    width: ${(props) => (props.width ? `${props.width}px` : '64px')};
    height: ${(props) => (props.height ? `${props.height}px` : '64px')};
    border-radius: 50%;
    border: 6px solid
      ${(props) => (props.isLight ? props.theme.typography.lightText : props.theme.typography.contrastText)};
    border-color: ${(props) => (props.isLight ? props.theme.typography.lightText : props.theme.typography.contrastText)}
      transparent ${(props) => (props.isLight ? props.theme.typography.lightText : props.theme.typography.contrastText)}
      transparent;
    animation: ${rotate} 1.2s linear infinite;
  }
`
