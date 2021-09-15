import styled from 'styled-components'

import { CustomScrollbar } from '../Layout'

type AccordionProps = {
  isOpen: boolean
  noscroll?: boolean
}

export const Accordion = styled.div<AccordionProps>`
  max-height: ${(props) => (props.isOpen ? '70vh' : '0vh')};
  transition: all 200ms ease;
  color: ${({ theme }) => theme.accordion.color}};
  background-color: ${({ theme }) => theme.accordion.bg_color}};
  overflow-y: hidden;
  ${(props) =>
    props.noscroll
      ? null
      : `overflow-y: scroll;
    ${CustomScrollbar};`}
`
