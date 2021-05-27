import styled from 'styled-components'

export const HyperLink = styled.a`
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
  }
`
