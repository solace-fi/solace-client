import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const Sidebar = styled.nav``

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

const ItemText = styled.li`
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 8px 0px 8px 16px;
  list-style: none;
  height: 60px;
`

const ItemList = styled.ul`
  width: 100%;
  padding: 0;
`

export const LayoutSidebar: React.FC = ({ children }) => {
  return (
    <Sidebar>
      <div style={{ position: 'fixed' }}>{children}</div>
    </Sidebar>
  )
}

export const SidebarItemList: React.FC = ({ children }) => {
  return (
    <ItemList>
      {React.Children.map(children, (child: any) => (
        <ItemText>{child}</ItemText>
      ))}
    </ItemList>
  )
}
