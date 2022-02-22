import styled, { css } from 'styled-components'

const halo = css`
  content: '';
  height: 6px;
  width: 6px;
  position: absolute;
  border-radius: 100%;
  border: 1px;
  border: 1px solid white;
  top: 0;
  left: 0;
`

export const ScrollDot = styled.div<{
  active?: boolean
  hoverable?: boolean
}>`
  ${({ hoverable }) =>
    css`
      cursor: pointer;
    `}

  position: relative;
  height: 8px;
  width: 8px;
  &::before {
    ${(props) => props.active && halo}
  }
  &:hover::before {
    ${(props) => props.hoverable && halo}
  }
  &::after {
    content: '';
    height: 4px;
    width: 4px;
    position: absolute;
    left: 2px;
    top: 2px;
    background-color: white;
    border-radius: 100%;
  }
`
