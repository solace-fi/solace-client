import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

interface LinkProps {
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
`

export const HyperLink = styled.a<LinkProps>`
  ${LinkCss}
`

export const StyledNavLink = styled(Link)<LinkProps>`
  ${LinkCss}
`
