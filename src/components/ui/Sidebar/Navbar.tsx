import React from 'react'
import { LayoutSidebar, SidebarItem, SidebarItemList } from './index'
import { Logo } from '../Logo'

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
        <SidebarItem className="playground-nav-link" to={'/playground'}>
          Playground{' '}
        </SidebarItem>
      </SidebarItemList>
    </LayoutSidebar>
  )
}

export default Navbar
