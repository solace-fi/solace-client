import Link from 'next/link'
import styled, { css } from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface LinkProps extends GeneralElementProps, GeneralTextProps {}

const LinkCss = css<LinkProps>`
  text-decoration: none;
  transition: opacity 0.2s;
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
