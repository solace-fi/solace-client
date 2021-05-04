import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const LayoutSidebar = styled.div`
  grid-column: 1/2;
  grid-row: 2/3;
  display: grid;
  align-content: start;
  gap: 16px;
`

export const SidebarItem = styled(NavLink)`
  font-weight: 600;
  font-size: 16px;
  opacity: 0.8;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
  }
`
