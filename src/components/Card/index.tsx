import React from 'react'

import styled from 'styled-components'

import { TextProps, handleTextProps } from '../Text'

export const CardContainer = styled.div<TextProps>`
  ${() => handleTextProps()}
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`

export const CardBase = styled.div<TextProps>`
  ${() => handleTextProps()}
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.3);
`

export const CardHeader = styled.div<TextProps>`
  ${() => handleTextProps()}
  grid-column: 1/3;
`

export const CardActions = styled.div<TextProps>`
  width: 100%;
`

export const CardTitle = styled.div<TextProps>`
  ${() => handleTextProps()}
  margin-bottom: 6px;
`

export const CardBlock = styled.div``

export const Card: React.FC = ({ children }) => {
  return <CardBase>{children}</CardBase>
}
