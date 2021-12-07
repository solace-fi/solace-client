import styled from 'styled-components'

type AccordionProps = {
  isOpen: boolean
  noscroll?: boolean
}

export const Accordion = styled.div<AccordionProps>`
  max-height: ${(props) => (props.isOpen ? '70vh' : '0vh')};
  transition: max-height 200ms ease;
  color: ${({ theme }) => theme.accordion.color}};
  background-color: ${({ theme }) => theme.accordion.bg_color}};
  overflow-y: hidden;
  ${(props) => (props.noscroll ? null : `overflow-y: auto;`)}
  border-radius: 10px;
`
