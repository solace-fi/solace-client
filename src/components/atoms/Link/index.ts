import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

const LinkCss = css`
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
  }
`

export const HyperLink = styled.a`
  ${LinkCss}
`

export const StyledNavLink = styled(Link)`
  ${LinkCss}
`
