/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import hooks

    SideNavbar function
      Render

    TopNavbar function
      custom hooks
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { SidebarItem, TopNav } from '../atoms/Navbar'
import { ButtonWrapper, NavButton } from '../atoms/Button'
import { Logo } from '../molecules/Logo'
import { ItemText, ItemList } from '../atoms/Navbar'
import { StyledMenu } from '../atoms/Icon'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { TransactionHistoryButton } from '../molecules/TransactionHistoryButton'
import { NetworkConnectButton } from '../molecules/NetworkConnectButton'
import { ThemeButton } from '../molecules/ThemeButton'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

interface NavbarProps {
  location: any
}

export const SideNavbar: React.FC<NavbarProps> = ({ location }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <nav>
      <div style={{ position: 'fixed' }}>
        <Logo />
        <ItemList>
          <ItemText>
            <SidebarItem to={'/'}>
              <Text high_em={location.pathname == '/'}>Dashboard</Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/invest'}>
              <Text high_em={location.pathname == '/invest'}>Invest</Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/quote'}>
              <Text high_em={location.pathname == '/quote'}>Buy Cover</Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/govern'}>
              <Text high_em={location.pathname == '/govern'}>Govern</Text>
            </SidebarItem>
          </ItemText>
        </ItemList>
      </div>
    </nav>
  )
}

export const TopNavbar: React.FC<NavbarProps> = ({ location }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { account } = useWallet()

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
      <Logo pl={10} />
      <ItemList>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/'}>
          <Text high_em={location.pathname == '/'}>Dashboard</Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          <Text high_em={location.pathname == '/invest'}>Invest</Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          <Text high_em={location.pathname == '/quote'}>Buy Cover</Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          <Text high_em={location.pathname == '/govern'}>Govern</Text>
        </SidebarItem>
        {width <= MAX_MOBILE_SCREEN_WIDTH && (
          <ButtonWrapper>
            <div onClick={() => setIsOpen(!isOpen)}>
              <NetworkConnectButton />
            </div>
            <div onClick={() => setIsOpen(!isOpen)}>
              <WalletConnectButton />
            </div>
            {account && (
              <div onClick={() => setIsOpen(!isOpen)}>
                <TransactionHistoryButton />
              </div>
            )}
            <div>
              <ThemeButton />
            </div>
          </ButtonWrapper>
        )}
      </ItemList>
      <NavButton onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu />
      </NavButton>
    </TopNav>
  )
}
