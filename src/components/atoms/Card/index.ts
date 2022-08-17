import styled, { css } from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'
import { ClickProps } from '../Button'
import { BKPT_3, BKPT_4 } from '../../../constants'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface CardProps extends ClickProps, GeneralElementProps {
  transparent?: boolean
  canHover?: boolean
  fade?: boolean
  color1?: boolean
  color2?: boolean
  success?: boolean
  warning?: boolean
  error?: boolean
  info?: boolean
  glow?: boolean
  matchBg?: boolean
  isHighlight?: boolean
}

interface CardContainerProps extends GeneralElementProps {
  cardsPerRow?: number
}

const CardCss = css<CardProps>`
  border-radius: 10px;
  padding: 24px;
  background: ${({ theme }) => theme.card.bg_color_0};
  ${(props) => props.color1 && `background: ${props.theme.card.bg_color_1};`}
  ${(props) => props.color2 && `background: ${props.theme.card.bg_color_2};`}
  ${(props) => props.isHighlight && `background: ${props.theme.table.highlight_bg_color};`}
  ${(props) => props.success && `background: ${props.theme.typography.successText};`}
  ${(props) => props.info && `background: ${props.theme.box.info};`}
  ${(props) => props.warning && `background: ${props.theme.box.warning};`}
  ${(props) => props.error && `background: ${props.theme.box.error};`}
  ${(props) => props.transparent && `background: rgba(255, 255, 255, 0);`}
  ${(props) => props.fade && `background: ${props.theme.card.fade};`}
  ${(props) => props.matchBg && `background: ${props.theme.body.bg_color};`}
  ${(props) =>
    props.canHover &&
    `cursor: pointer; &:hover { background-color: ${props.theme.card.hover_color}; transition: background-color 200ms linear; }`}
  ${(props) => props.glow && `box-shadow: ${props.theme.card.glow};`}
  ${GeneralElementCss}
`

export const CardContainer = styled.div<CardContainerProps & GeneralTextProps>`
  display: grid;
  grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow : '3')}, 1fr);
  gap: 24px;
  ${GeneralTextCss}
  ${GeneralElementCss}

  @media screen and (max-width: ${BKPT_4}px) {
    grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow - 1 : '2')}, 1fr);
  }

  @media screen and (max-width: ${BKPT_3}px) {
    grid-template-columns: repeat(${(props) => (props.cardsPerRow ? props.cardsPerRow - 2 : '1')}, 1fr);
  }
`

export const Card = styled.div<CardProps>`
  ${CardCss}
  ${GeneralElementCss}
`
