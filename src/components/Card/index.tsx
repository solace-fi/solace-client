import React from 'react'

import styled, { css } from 'styled-components'

import { TextProps, handleTextProps } from '../Text'

interface CardProps {
  cardsPerRow?: number
  transparent?: boolean
}

export const CardContainer = styled.div<CardProps & TextProps>`
  ${() => handleTextProps()}
  display: grid;
  grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow : '3')}, 1fr);
  gap: 24px;
`

const CardBase = css<CardProps>`
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, ${(props) => (props.transparent ? '0' : '0.3')});
`

export const CardBaseComponent = styled.div<CardProps & TextProps>`
  ${CardBase}
`

const InvestmentCard = styled.div<CardProps & TextProps>`
  ${CardBase}
  ${() => handleTextProps()}
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`

const PositionCard = styled.div<CardProps & TextProps>`
  ${CardBase}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

export const InvestmentCardComponent: React.FC<CardProps & TextProps> = ({ cardsPerRow, transparent, children }) => {
  return (
    <InvestmentCard cardsPerRow={cardsPerRow} transparent={transparent}>
      {children}
    </InvestmentCard>
  )
}

export const PositionCardComponent: React.FC<CardProps & TextProps> = ({ cardsPerRow, transparent, children }) => {
  return (
    <PositionCard cardsPerRow={cardsPerRow} transparent={transparent}>
      {children}
    </PositionCard>
  )
}
