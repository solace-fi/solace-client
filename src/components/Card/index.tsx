import React from 'react'

import styled, { css } from 'styled-components'
import { ClickProps } from '../Button'
import { FlexCol } from '../Layout'

import { GeneralTextProps, GeneralTextCss } from '../Text'

interface CardProps extends ClickProps {
  cardsPerRow?: number
  transparent?: boolean
}

export const CardContainer = styled.div<CardProps & GeneralTextProps>`
  ${GeneralTextCss}
  display: grid;
  grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow : '3')}, 1fr);
  gap: 24px;
`

const CardBase = css<CardProps>`
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, ${(props) => (props.transparent ? '0' : '0.3')});
  ${(props) =>
    props.disabled && '{color: #fff; background-color: rgba(0, 255, 209, 0.3); opacity: 0.5; pointer-events: none }'}
`

export const CardBaseComponent = styled.div<CardProps & GeneralTextProps>`
  ${CardBase}
`

const InvestmentCard = styled.div<CardProps & GeneralTextProps>`
  ${CardBase}
  ${GeneralTextCss}
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`

const PositionCard = styled(FlexCol)<CardProps & GeneralTextProps>`
  ${CardBase}
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
    transition: background-color 200ms linear;
  }
`

export const CardHeader = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  grid-column: 1/3;
`

export const CardActions = styled.div<GeneralTextProps>`
  width: 100%;
`

export const CardTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  margin-bottom: 6px;
`

export const CardBlock = styled.div``

export const InvestmentCardComponent: React.FC<CardProps & GeneralTextProps> = ({
  cardsPerRow,
  transparent,
  children,
}) => {
  return (
    <InvestmentCard cardsPerRow={cardsPerRow} transparent={transparent}>
      {children}
    </InvestmentCard>
  )
}

export const PositionCardComponent: React.FC<CardProps & GeneralTextProps> = ({
  onClick,
  cardsPerRow,
  transparent,
  children,
  disabled,
}) => {
  return (
    <PositionCard cardsPerRow={cardsPerRow} transparent={transparent} disabled={disabled} onClick={onClick}>
      {children}
    </PositionCard>
  )
}
