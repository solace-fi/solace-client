import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface LinkProps extends GeneralElementProps, GeneralTextProps {
  underline?: boolean
}

const LinkCss = css<LinkProps>`
  text-decoration: none;
  transition: opacity 0.2s;
  ${(props) => props.underline && 'text-decoration: underline;'}
  &:hover,
  &.is-active {
    opacity: 1;
  }
  ${GeneralElementCss}
  ${GeneralTextCss}
`

export const HyperLink = styled.a<LinkProps>`
  ${LinkCss}
`

export const StyledNavLink = styled(Link)<LinkProps>`
  ${LinkCss}
`
