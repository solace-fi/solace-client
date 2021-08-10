import styled, { css } from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'
import { ClickProps } from '../Button'
import { FlexCol } from '../Layout'

import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface CardProps extends ClickProps {
  transparent?: boolean
  fade?: boolean
  standalone?: boolean
}

interface CardContainerProps extends GeneralElementProps {
  cardsPerRow?: number
}

const CardCss = css<CardProps>`
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, ${(props) => (props.transparent ? '0' : '0.1')});
  ${(props) => props.fade && '{background-color: rgba(0, 176, 144, 0.3); }'}
`

export const CardContainer = styled.div<CardContainerProps & GeneralTextProps>`
  display: grid;
  grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow : '3')}, 1fr);
  gap: 24px;
  ${GeneralTextCss}
  ${GeneralElementCss}

  @media screen and (max-width: 900px) {
    grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow - 1 : '2')}, 1fr);
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow - 2 : '1')}, 1fr);
  }
`

export const Card = styled.div<CardProps>`
  ${CardCss}
`

export const InvestmentCard = styled.div<CardProps>`
  display: grid;
  align-content: start;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  ${CardCss}
`

export const PositionCard = styled(FlexCol)<CardProps>`
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${(props) =>
    props.fade
      ? null
      : '&:hover { background-color: rgba(255, 255, 255, 0.5); transition: background-color 200ms linear; }'}
  ${CardCss}
`

export const CardHeader = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  grid-column: 1/3;
`

export const CardTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  margin-bottom: 6px;
`

export const CardBlock = styled.div``
