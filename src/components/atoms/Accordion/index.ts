import styled, { css } from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'
import { ThinScrollbarCss } from '../Scrollbar/ThinScrollbar'

type AccordionProps = GeneralElementProps & {
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
  ${GeneralElementCss}
  max-height: ${(props) => (props.isOpen ? props.customHeight ?? '70vh' : '0vh')};
  transition: max-height
    ${(props) => {
      if (props.isOpen) {
        return props.openSpeed ? props.openSpeed : 200
      } else {
        return props.closeSpeed ? props.closeSpeed : 200
      }
    }}ms
    ease;
  color: ${({ theme }) => theme.accordion.color};
  ${(props) => !props.noBackgroundColor && `background-color: ${props.theme.accordion.bg_color};`}
  overflow-y: hidden;
  ${(props) => (props.noScroll ? null : `overflow-y: auto;`)}
  ${(props) => (props.thinScrollbar ? ThinScrollbarCss : null)}
  ${(props) =>
    !props.hideScrollbar
      ? ''
      : css`
          ::-webkit-scrollbar {
            width: 0px;
          }
          scrollbar-width: none;
          -ms-overflow-style: none;
        `}
  border-radius: 10px;
`
