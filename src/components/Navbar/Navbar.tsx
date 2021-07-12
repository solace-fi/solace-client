import React, { useEffect, useState } from 'react'
import { SidebarItem, ItemText, ItemList, Sidebar } from './index'
import styled from 'styled-components'
import { Logo } from '../Logo'
import { ButtonBaseCss, handleButtonProps } from '../Button'
import { Menu } from '@styled-icons/boxicons-regular/Menu'
import { MAX_DEVICE_SCREEN_WIDTH } from '../../constants'

interface TopNavProps {
  isOpen?: boolean
}

const NavSidebar: React.FC = ({ children }) => {
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

const TopNav = styled.div<TopNavProps>`
  ${(props) => (props.isOpen == false ? 'max-height: 4rem;' : 'max-height: 8rem;')}
  position: fixed;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.9);
  display: none;
  padding: 10px;
  transition: 200ms ease;

  @media screen and (max-width: ${MAX_DEVICE_SCREEN_WIDTH}px) {
    display: block;
    width: 100%;
    z-index: 1;
  }
`
const NavButton = styled.button`
  ${ButtonBaseCss}
  display: block;
  position: absolute;
  right: 30px;
  top: 15px;
  min-height: 40px;
  min-width: 70px;
  ${() => handleButtonProps()};
`

export const SideNavbar = (): any => {
  return (
    <NavSidebar>
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
    </NavSidebar>
  )
}

export const Navbar = (): any => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  document.addEventListener('scroll', function (e) {
    setIsOpen(false)
  })

  return (
    <TopNav isOpen={isOpen} id="topnav">
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
