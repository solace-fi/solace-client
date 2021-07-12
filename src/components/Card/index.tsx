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

  @media screen and (max-width: 1215px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 900px) {
    grid-template-columns: repeat(1, 1fr);
  }
`

const CardBase = css<CardProps>`
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, ${(props) => (props.transparent ? '0' : '0.2')});
  ${(props) =>
    props.disabled && '{color: #fff; background-color: rgba(0, 255, 209, 0.3); opacity: 0.5; pointer-events: none }'}
`

export const CardBaseComponent = styled.div<CardProps & GeneralTextProps>`
  ${CardBase}
  ${GeneralTextCss}
`

export const ClaimCard = styled.div<CardProps & GeneralTextProps>`
  ${CardBase}
  ${GeneralTextCss}
`

export const InvestmentCard = styled.div<CardProps & GeneralTextProps>`
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  ${CardBase}
  ${GeneralTextCss}
`

export const PositionCard = styled(FlexCol)<CardProps & GeneralTextProps>`
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
    transition: background-color 200ms linear;
  }
  ${CardBase}
  ${GeneralTextCss}
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
