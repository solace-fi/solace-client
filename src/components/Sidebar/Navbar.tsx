import React from 'react'
import { SidebarItem, ItemText, ItemList, Sidebar } from './index'
import { Logo } from '../Logo'

const LayoutSidebar: React.FC = ({ children }) => {
  return (
    <Sidebar>
      <div style={{ position: 'fixed' }}>{children}</div>
    </Sidebar>
  )
}

const SidebarItemList: React.FC = ({ children }) => {
  return (
    <ItemList>
      {React.Children.map(children, (child: any) => (
        <ItemText>{child}</ItemText>
      ))}
    </ItemList>
  )
}

export const Navbar = (): any => {
  return (
    <LayoutSidebar>
      <Logo />
      <SidebarItemList>
        <SidebarItem className="dashboard-bar-link" to={'/'}>
          Dashboard
        </SidebarItem>
        <SidebarItem className="invest-nav-link" to={'/invest'}>
          Invest
        </SidebarItem>
        <SidebarItem className="quote-nav-link" to={'/quote'}>
          Quote
        </SidebarItem>
        <SidebarItem className="govern-nav-link" to={'/govern'}>
          Govern
        </SidebarItem>
      </SidebarItemList>
    </LayoutSidebar>
  )
}

export default Navbar
