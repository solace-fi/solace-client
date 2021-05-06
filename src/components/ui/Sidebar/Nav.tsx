import React from 'react'
import { LayoutSidebar, SidebarItem } from './index'

export const Nav = (): any => {
  return (
    <LayoutSidebar>
      <SidebarItem className="dashboard-nav-link" to={'/'}>
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
    </LayoutSidebar>
  )
}

export default Nav
