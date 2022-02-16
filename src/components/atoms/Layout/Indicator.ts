import styled from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { LayoutProps } from '.'

export const HorizRule = styled.hr<LayoutProps & GeneralElementProps>`
  ${GeneralElementCss}
  border: none;
  ${(props) => `color: ${props.theme.typography.contrastText};`}
  height: 1px;
  ${(props) => `background-color: ${props.theme.typography.contrastText};`}
  ${(props) =>
    props.location &&
    props.location.pathname == '/' &&
    `background-color: ${props.theme.typography.lightText} !important;`}
`

export const MultiTabIndicator = styled.hr`
  position: absolute;
  width: 50%;
  left: 0%;
  top: 40px;
  border-color: ${({ theme }) => theme.typography.infoText};
  border-width: 2px;
  transition: all 200ms ease;
`
