import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

const LinkBase = css`
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
  }
`

export const HyperLink = styled.a`
  ${LinkBase}
`

export const StyledLink = styled(Link)`
  ${LinkBase}
`
