/*************************************************************************************

    Table of Contents:

    import react
    import components

    SideNavbar function
      Render

    TopNavbar function
      custom hooks
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useState } from 'react'

/* import components */
import { SidebarItem, TopNav } from '../atoms/Navbar'
import { NavButton } from '../atoms/Button'
import { Logo } from '../molecules/Logo'
import { ItemText, ItemList } from '../atoms/Navbar'
import { StyledMenu } from '../atoms/Icon'

export const SideNavbar: React.FC = () => {
  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <nav>
      <div style={{ position: 'fixed' }}>
        <Logo />
        <ItemList>
          <ItemText>
            <SidebarItem to={'/'}>Dashboard</SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/invest'}>Invest</SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/quote'}>Buy Cover</SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/govern'}>Govern</SidebarItem>
          </ItemText>
        </ItemList>
      </div>
    </nav>
  )
}

export const TopNavbar: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const [isOpen, setIsOpen] = useState<boolean>(false)

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    document.addEventListener('scroll', function (e) {
      setIsOpen(false)
    })

    return () => {
      document.removeEventListener('scroll', function (e) {
        setIsOpen(false)
      })
    }
  }, [])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <TopNav isOpen={isOpen}>
      <Logo />
      <ItemList>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/'}>
          Dashboard
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          Invest
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          Buy Cover
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          Govern
        </SidebarItem>
      </ItemList>
      <NavButton onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu />
      </NavButton>
    </TopNav>
  )
}
