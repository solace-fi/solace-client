/*************************************************************************************

    Table of Contents:

    import react
    import packages
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

/* import packages */
import { useLocation } from 'react-router'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { SidebarItem, TopNav, ItemText, ItemList, SidebarText } from '../atoms/Navbar'
import { NavButton, Button } from '../atoms/Button'
import { Logo } from '../molecules/Logo'
import { StyledMedium, StyledMenu } from '../atoms/Icon'
import { Text, TextSpan } from '../atoms/Typography'
import { HyperLink } from '../atoms/Link'
import { StyledDiscord, StyledGithub, StyledTwitter } from '../atoms/Icon'
import { ThemeButton } from '../molecules/ThemeButton'
import { HorizRule } from '../atoms/Layout'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { SidebarAccount } from './Account'

export const SideNavbar: React.FC = () => {
  const location = useLocation()

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    // <nav>
    <div style={{ position: 'fixed', overflow: 'auto', top: '0', bottom: '0' }}>
      <div
        style={{
          padding: '40px 5px 0px 5px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: `calc(110vh - calc(${window.screen.height}px - ${window.innerHeight}px))`,
        }}
      >
        <Logo location={location} mb={20} />
        <SidebarAccount light={location.pathname == '/'} />
        <ItemList>
          <HorizRule location={location} />
          <ItemText>
            <SidebarItem to={'/dashboard'}>
              <Text bold={location.pathname == '/dashboard'} light={location.pathname == '/'}>
                Dashboard
              </Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/quote'}>
              <Text bold={location.pathname == '/quote'} light={location.pathname == '/'}>
                Buy Cover
              </Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/invest'}>
              <Text bold={location.pathname == '/invest'} light={location.pathname == '/'}>
                Invest
              </Text>
            </SidebarItem>
          </ItemText>
          <ItemText>
            <SidebarItem to={'/govern'}>
              <Text bold={location.pathname == '/govern'} light={location.pathname == '/'}>
                Govern
              </Text>
            </SidebarItem>
          </ItemText>
        </ItemList>
        <ItemList style={{ marginTop: 'auto', marginBottom: '0' }}>
          <ItemText>
            <HyperLink
              href={'https://docs.solace.fi/'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText>
                <TextSpan t4 light={location.pathname == '/'}>
                  Docs
                </TextSpan>
              </SidebarText>
            </HyperLink>
          </ItemText>
          <ItemText>
            <HyperLink
              href={'https://whitepaper.solace.fi/'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText>
                <TextSpan t4 light={location.pathname == '/'}>
                  Whitepaper
                </TextSpan>
              </SidebarText>
            </HyperLink>
          </ItemText>
          <ItemText>
            <HyperLink
              href={'https://angel.co/company/solace-fi/jobs'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText>
                <TextSpan t4 light={location.pathname == '/'}>
                  Jobs
                </TextSpan>
              </SidebarText>
            </HyperLink>
          </ItemText>
          <HorizRule location={location} />
          <ItemText style={{ padding: '4px 0', justifyContent: 'space-between' }}>
            <HyperLink
              href={'https://discord.gg/7v8qsyepfu'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText light={location.pathname == '/'}>
                <StyledDiscord size={20} />
              </SidebarText>
            </HyperLink>
            <HyperLink
              href={'https://twitter.com/solacefi'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText light={location.pathname == '/'}>
                <StyledTwitter size={20} />
              </SidebarText>
            </HyperLink>
            <HyperLink
              href={'https://github.com/solace-fi'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText light={location.pathname == '/'}>
                <StyledGithub size={20} />
              </SidebarText>
            </HyperLink>
            <HyperLink
              href={'https://medium.com/solace-fi'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <SidebarText light={location.pathname == '/'}>
                <StyledMedium size={20} />
              </SidebarText>
            </HyperLink>
          </ItemText>
          <HorizRule location={location} />
          <ThemeButton light={location.pathname == '/'} />
        </ItemList>
      </div>
    </div>
    // </nav>
  )
}

export const TopNavbar: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const { openModal } = useGeneral()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const location = useLocation()

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
      <Logo location={location} pl={10} />
      <ItemList>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/dashboard'}>
          <Text light bold={location.pathname == '/dashboard'}>
            Dashboard
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          <Text light bold={location.pathname == '/quote'}>
            Buy Cover
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          <Text light bold={location.pathname == '/invest'}>
            Invest
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          <Text light bold={location.pathname == '/govern'}>
            Govern
          </Text>
        </SidebarItem>
        {width <= MAX_MOBILE_SCREEN_WIDTH && (
          <>
            <ThemeButton light />
            <Button light mt={20} ml={20} mr={20} onClick={() => openModal()}>
              Community Links
            </Button>
          </>
        )}
      </ItemList>
      <NavButton light onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu size={40} />
      </NavButton>
    </TopNav>
  )
}
