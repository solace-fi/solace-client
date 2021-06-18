import React, { useState } from 'react'
import { SidebarItem, ItemText, ItemList, Sidebar } from './index'
import styled from 'styled-components'
import { Logo } from '../Logo'
import { ButtonBaseCss, handleButtonProps } from '../Button'
import { Menu } from '@styled-icons/boxicons-regular/Menu'

import logo from '../../static/solace.png'
import { Prices } from '../Header/Prices'

import { getNetworkName } from '../../utils'
import { Heading3 } from '../Text'
import { useWallet } from '../../context/WalletManager'

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

  const TopNav = styled.div`
    position: fixed;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 1);
    display: none;
    padding: 10px;

    @media screen and (max-width: 1160px) {
      display: block;
      width: 100%;
      z-index: 1;
    }
  `
  const NavButton = styled.button`
    ${ButtonBaseCss}
    display: block;
    position: absolute;
    right: 20px;
    top: 10px;
    min-height: 40px;
    min-width: 70px;
    ${() => handleButtonProps()};
  `

  return (
    <TopNav>
      <div style={{ position: 'relative' }}>
        <img style={{ width: '114px' }} src={logo} />
        {isOpen && (
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
        )}
        <NavButton onClick={() => setIsOpen(!isOpen)}>
          <Menu />
        </NavButton>
      </div>
    </TopNav>
  )
}
