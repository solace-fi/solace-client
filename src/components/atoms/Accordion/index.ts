import styled, { css } from 'styled-components'
import { Theme } from '../../../styles/themes'

type AccordionProps = {
  isOpen: boolean
  noScroll?: boolean
  noBackgroundColor?: boolean
  customHeight?: string
  openSpeed?: number
  closeSpeed?: number
  hideScrollbar?: boolean
  thinScrollbar?: boolean
}

export const Accordion = styled.div<AccordionProps>`
  max-height: ${(props) => (props.isOpen ? props.customHeight ?? '70vh' : '0vh')};
  transition: max-height ${(props) => {
    if (props.isOpen) {
      return props.openSpeed ? props.openSpeed : 200
    } else {
      return props.closeSpeed ? props.closeSpeed : 200
    }
  }}ms ease;
  color: ${({ theme }) => theme.accordion.color}};
  ${(props) => !props.noBackgroundColor && `background-color: ${props.theme.accordion.bg_color};`}
  overflow-y: hidden;
  ${(props) => (props.noScroll ? null : `overflow-y: auto;`)}
  ${(props) =>
    props.thinScrollbar
      ? css`
          ::-webkit-scrollbar {
            width: 0.5em;
          }
          ::-webkit-scrollbar-track {
            background-color: ${(props.theme as Theme).separator.bg_color};
          }
          ::-webkit-scrollbar-thumb {
            height: 2em;
            /* background-color: ${(props.theme as Theme).body.bg_color}; */
            background-image: linear-gradient(
              to bottom right,
              ${(props.theme as Theme).typography.warmGradientA},
              ${(props.theme as Theme).typography.warmGradientB}
            );
          }
        `
      : null}
  ${(props) =>
    !props.hideScrollbar
      ? null
      : css`
          ::-webkit-scrollbar {
          ::-webkit-scrollbar {
            width: 0px;
          }
          scrollbar-width: none;
          -ms-overflow-style: none;
        `}
  border-radius: 10px;
`
