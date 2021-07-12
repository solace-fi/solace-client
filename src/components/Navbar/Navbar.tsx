import React, { useState } from 'react'
import { SidebarItem, ItemText, ItemList, TopNav, NavButton } from './index'
import { Logo } from '../Logo'
import { Menu } from '@styled-icons/boxicons-regular/Menu'

const SidebarItemList: React.FC = ({ children }) => {
  return (
    <ItemList>
      {React.Children.map(children, (child: any) => (
        <ItemText>{child}</ItemText>
      ))}
    </ItemList>
  )
}

export const SideNavbar = (): any => {
  return (
    <nav>
      <div style={{ position: 'fixed' }}>
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
      </div>
    </nav>
  )
}

export const TopNavbar = (): any => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  document.addEventListener('scroll', function (e) {
    setIsOpen(false)
  })

  return (
    <TopNav isOpen={isOpen}>
      <Logo />
      <SidebarItemList>
        <SidebarItem className="dashboard-bar-link" onClick={() => setIsOpen(!isOpen)} to={'/'}>
          Dashboard
        </SidebarItem>
        <SidebarItem className="invest-nav-link" onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          Invest
        </SidebarItem>
        <SidebarItem className="quote-nav-link" onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          Quote
        </SidebarItem>
        <SidebarItem className="govern-nav-link" onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          Govern
        </SidebarItem>
      </SidebarItemList>
      <NavButton onClick={() => setIsOpen(!isOpen)}>
        <Menu />
      </NavButton>
    </TopNav>
  )
}
