import React from 'react'
import styled, { keyframes } from 'styled-components'

interface LoaderProps {
  style?: any
  width?: number
  height?: number
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }`

const LoadingIcon = styled.div<LoaderProps>`
  width: ${(props) => (props.width ? `${props.width + 20}px` : '80px')};
  height: ${(props) => (props.height ? `${props.height + 20}px` : '80px')};
  margin: auto;
  &:after {
    content: ' ';
    display: block;
    width: ${(props) => (props.width ? `${props.width}px` : '64px')};
    height: ${(props) => (props.height ? `${props.height}px` : '64px')};
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: ${rotate} 1.2s linear infinite;
  }
`

export const Loader: React.FC<LoaderProps> = ({ style, width, height }) => {
  return <LoadingIcon style={style} width={width} height={height} />
}
