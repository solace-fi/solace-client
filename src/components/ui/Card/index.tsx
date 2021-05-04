import React from 'react'

import styled from 'styled-components'

import { TextProps as StyleProps, handleTextProps } from '../Text'

export const CardContainer = styled.div<StyleProps>`
  ${(props) => handleTextProps(props)}
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`

export const CardBase = styled.div<StyleProps>`
  ${(props) => handleTextProps(props)}
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.3);
`

export const CardHeader = styled.div<StyleProps>`
  ${(props) => handleTextProps(props)}
  grid-column: 1/3;
`

export const CardActions = styled.div<StyleProps>`
  width: 100%;
`

export const CardTitle = styled.div<StyleProps>`
  ${(props) => handleTextProps(props)}
  margin-bottom: 6px;
`

export const CardBlock = styled.div``

export const Card: React.FC = ({ children }) => {
  return <CardBase>{children}</CardBase>
}
