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
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { SidebarItem, TopNav, ItemText, ItemList, SidebarText } from '../atoms/Navbar'
import { ButtonWrapper, NavButton, Button } from '../atoms/Button'
import { Logo } from '../molecules/Logo'
import { StyledDocuments, StyledDocumentText, StyledMedium, StyledMenu, StyledWork } from '../atoms/Icon'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { TransactionHistoryButton } from '../molecules/TransactionHistoryButton'
import { NetworkConnectButton } from '../molecules/NetworkConnectButton'
import { Text, TextSpan } from '../atoms/Typography'
import { HyperLink } from '../atoms/Link'
import { StyledDiscord, StyledGithub, StyledTwitter } from '../atoms/Icon'
import { ThemeSwitch } from '../molecules/ThemeSwitch'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

interface NavbarProps {
  location: any
}

export const SideNavbar: React.FC<NavbarProps> = ({ location }) => {
  /*************************************************************************************

    Render

  *************************************************************************************/

  console.log(window.screen.height, window.innerHeight)

  return (
    <nav>
      <div style={{ position: 'fixed', overflow: 'auto', top: '0', bottom: '0' }}>
        <div
          style={{
            padding: '40px 5px 0px 5px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: `calc(110vh - calc(${window.screen.height}px - ${window.innerHeight}px))`,
          }}
        >
          <Logo />
          <ItemList>
            <ItemText>
              <SidebarItem to={'/'}>
                <Text high_em={location.pathname == '/'}>Dashboard</Text>
              </SidebarItem>
            </ItemText>
            <ItemText>
              <SidebarItem to={'/quote'}>
                <Text high_em={location.pathname == '/quote'}>Buy Cover</Text>
              </SidebarItem>
            </ItemText>
            <ItemText>
              <SidebarItem to={'/invest'}>
                <Text high_em={location.pathname == '/invest'}>Invest</Text>
              </SidebarItem>
            </ItemText>
            <ItemText>
              <SidebarItem to={'/govern'}>
                <Text high_em={location.pathname == '/govern'}>Govern</Text>
              </SidebarItem>
            </ItemText>
          </ItemList>
          <ItemList style={{ marginTop: 'auto', marginBottom: '0' }}>
            <ItemText style={{ padding: '4px 0' }}>
              <HyperLink
                href={'https://docs.solace.fi/'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <TextSpan t4>Docs</TextSpan>
                </SidebarText>
              </HyperLink>
            </ItemText>
            <ItemText style={{ padding: '4px 0' }}>
              <HyperLink
                href={'https://whitepaper.solace.fi/'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <TextSpan t4>Whitepaper</TextSpan>
                </SidebarText>
              </HyperLink>
            </ItemText>
            <ItemText style={{ padding: '4px 0' }}>
              <HyperLink
                href={'https://angel.co/company/solace-fi/jobs'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <TextSpan t4>Jobs</TextSpan>
                </SidebarText>
              </HyperLink>
            </ItemText>
            <hr />
            <ItemText style={{ padding: '4px 0', justifyContent: 'space-between' }}>
              <HyperLink
                href={'https://discord.gg/7v8qsyepfu'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <StyledDiscord size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://twitter.com/solacefi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <StyledTwitter size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://github.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <StyledGithub size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://medium.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText>
                  <StyledMedium size={20} />
                </SidebarText>
              </HyperLink>
            </ItemText>
            <ThemeSwitch />
          </ItemList>
        </div>
      </div>
    </nav>
  )
}

export const TopNavbar: React.FC<NavbarProps> = ({ location }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const { openModal } = useGeneral()
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
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          <Text high_em={location.pathname == '/quote'}>Buy Cover</Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          <Text high_em={location.pathname == '/invest'}>Invest</Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          <Text high_em={location.pathname == '/govern'}>Govern</Text>
        </SidebarItem>
        {width <= MAX_MOBILE_SCREEN_WIDTH && (
          <>
            <ThemeSwitch />

            {/* <ButtonWrapper>
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
            </ButtonWrapper> */}
            <Button ml={20} mr={20} onClick={() => openModal()}>
              Community Links
            </Button>
          </>
        )}
      </ItemList>
      <NavButton onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu />
      </NavButton>
    </TopNav>
  )
}
