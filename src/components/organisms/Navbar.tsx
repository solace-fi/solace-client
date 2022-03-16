/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import resources
    import hooks

    SideNavbar
      hooks

    TopNavbar
      hooks
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

/* import managers */
import { useGeneral } from '../../context/GeneralManager'
import { useNotifications } from '../../context/NotificationsManager'

/* import constants */
import { BKPT_3 } from '../../constants'
import { SystemNotice } from '../../constants/enums'
import { PageInfo } from '../../constants/types'

/* import components */
import { SidebarItem, TopNav, ItemText, ItemList, SidebarText } from '../atoms/Navbar'
import { NavButton } from '../atoms/Button'
import { Logo, MiniLogo } from '../molecules/Logo'
import {
  StyledMedium,
  StyledMenu,
  StyledDiscord,
  StyledGithub,
  StyledTwitter,
  StyledDocuments,
  StyledWork,
  StyledLockFile,
} from '../atoms/Icon'
import { Text, TextSpan } from '../atoms/Typography'
import { HyperLink } from '../atoms/Link'
import { ThemeButton } from '../molecules/ThemeButton'
import { Flex, HorizRule } from '../atoms/Layout'
import { MiniUserAccount, UserAccount } from '../molecules/Account'
import { StyledNavTooltip } from '../molecules/Tooltip'
import { AuditToast } from '../molecules/Toast'

/* import resources */

import AlchemyBadgeLight from '../../resources/svg/alchemy-badge-light.svg'
import AlchemyBadgeDark from '../../resources/svg/alchemy-badge-dark.svg'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
// import styled from 'styled-components'

// const NavbarWrapper = styled.div`
//   &::-webkit-scrollbar {
//     display: none;
//   }
// `

interface Navbar {
  pages: PageInfo[]
}

export const SideNavbar: React.FC<Navbar> = ({ pages }) => {
  /*

  hooks

  */
  const { appTheme } = useGeneral()
  const location = useLocation()
  const { width } = useWindowDimensions()
  const miniNavbarMarginSet = useMemo(() => {
    return {
      marginLeft: width <= BKPT_3 ? 'auto' : 'unset',
      marginRight: width <= BKPT_3 ? 'auto' : 'unset',
    }
  }, [width])
  const lightText = useMemo(() => location.pathname == '/', [location])

  return (
    <div
      style={{
        position: 'fixed',
        overflow: 'auto',
        top: '0',
        bottom: '0',
        display: 'flex',
        background: 'transparent',
        // scrollbarWidth: 'thin',
      }}
    >
      <div
        style={{
          padding: '40px 5px 0px 5px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {width > BKPT_3 ? (
          <>
            <Logo location={location} mb={35} />
            <UserAccount light={location.pathname == '/'} />
          </>
        ) : (
          <>
            <MiniLogo location={location} mb={35} />
            <StyledNavTooltip id={'mini-account-nav'} tip={'Account'}>
              <MiniUserAccount light={lightText} width={40} />
            </StyledNavTooltip>
          </>
        )}
        <ItemList>
          <HorizRule location={location} />
          {pages.map((p) => (
            <StyledNavTooltip key={p.to} id={`${p.to}-nav`} tip={p.name}>
              <ItemText>
                <SidebarItem to={p.to} style={miniNavbarMarginSet}>
                  <Text info={location.pathname == p.to} light={lightText} t3s>
                    {width > BKPT_3 ? p.name : p.icon}
                  </Text>
                </SidebarItem>
              </ItemText>
            </StyledNavTooltip>
          ))}
        </ItemList>
        <div style={{ flex: '1 1' }}></div>
        <ItemList>
          <StyledNavTooltip id={'docs-nav'} tip={'Docs'}>
            <ItemText>
              <HyperLink
                href={'https://docs.solace.fi/'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t3s light={lightText}>
                    {width > BKPT_3 ? 'Docs' : <StyledDocuments size={30} />}
                  </TextSpan>
                </SidebarText>
              </HyperLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'jobs-nav'} tip={`We\'re hiring!`}>
            <ItemText>
              <HyperLink
                href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t3s light={lightText} bold>
                    {width > BKPT_3 ? `We\'re hiring!` : <StyledWork size={30} />}
                  </TextSpan>
                </SidebarText>
              </HyperLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'terms-nav'} tip={'Terms & Conditions'}>
            <ItemText>
              <SidebarItem to={'/terms'} style={{ ...miniNavbarMarginSet }}>
                <TextSpan t3s light={lightText}>
                  {width > BKPT_3 ? 'Terms & Conditions' : <StyledLockFile size={30} />}
                </TextSpan>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
          <HorizRule location={location} />
          {width > BKPT_3 ? (
            <ItemText jc={'space-between'} style={{ padding: '4px 0' }}>
              <HyperLink
                href={'https://discord.gg/7v8qsyepfu'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledDiscord size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://twitter.com/solacefi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledTwitter size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://github.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledGithub size={20} />
                </SidebarText>
              </HyperLink>
              <HyperLink
                href={'https://medium.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledMedium size={20} />
                </SidebarText>
              </HyperLink>
            </ItemText>
          ) : (
            <ItemList>
              <StyledNavTooltip id={'discord-nav'} tip={'Discord'}>
                <ItemText>
                  <HyperLink
                    href={'https://discord.gg/7v8qsyepfu'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledDiscord size={20} />
                    </SidebarText>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'twitter-nav'} tip={'Twitter'}>
                <ItemText>
                  <HyperLink
                    href={'https://twitter.com/solacefi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledTwitter size={20} />
                    </SidebarText>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'github-nav'} tip={'GitHub'}>
                <ItemText>
                  <HyperLink
                    href={'https://github.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledGithub size={20} />
                    </SidebarText>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'medium-nav'} tip={'Medium'}>
                <ItemText>
                  <HyperLink
                    href={'https://medium.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledMedium size={20} />
                    </SidebarText>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
            </ItemList>
          )}
          <HorizRule location={location} />
          <StyledNavTooltip id={'theme-nav'} tip={'Change Theme'}>
            <ThemeButton light={lightText} width={0} p={10} />
          </StyledNavTooltip>
          {width > BKPT_3 && (
            <>
              {appTheme == 'light' && (
                <Flex justifyCenter>
                  <img src={AlchemyBadgeLight} style={{ width: '145px' }} />
                </Flex>
              )}
              {appTheme == 'dark' && (
                <Flex justifyCenter>
                  <img src={AlchemyBadgeDark} style={{ width: '145px' }} />
                </Flex>
              )}
            </>
          )}
        </ItemList>
      </div>
    </div>
  )
}

export const TopNavbar: React.FC<Navbar> = ({ pages }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const location = useLocation()
  const { toastSettings, makeAppToast } = useNotifications()

  const handleIsOpen = (toggle: boolean) => {
    if (!toggle) {
      const topNavbar = document.getElementById('top-nav')
      if (topNavbar) {
        topNavbar.scrollTop = 0
      }
    }
    setIsOpen(toggle)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (location && location.pathname && location.pathname != '/' && location.pathname != '/terms') {
      makeAppToast(
        {
          type: SystemNotice.AUDIT_NOTICE,
          metadata: 'Audited',
          uniqueId: `${SystemNotice.AUDIT_NOTICE}`,
        },
        SystemNotice.AUDIT_NOTICE,
        <AuditToast />,
        toastSettings.appNotice,
        true
      )
    }
  }, [location])

  return (
    <TopNav id="top-nav" isOpen={isOpen} style={{ overflowY: isOpen ? 'auto' : 'hidden' }}>
      <Logo location={location} pl={10} />
      <ItemList>
        {pages.map((p) => (
          <SidebarItem key={p.to} onClick={() => handleIsOpen(!isOpen)} to={p.to} style={{ padding: '20px 0' }}>
            <Text light bold={location.pathname == p.to}>
              {p.name}
            </Text>
          </SidebarItem>
        ))}
      </ItemList>
      <HorizRule />
      <UserAccount light={location.pathname == '/'} />
      <ItemList>
        <ItemText jc={'center'} style={{ padding: '10px' }}>
          <HyperLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
            <TextSpan t3s light>
              Docs
            </TextSpan>
          </HyperLink>
        </ItemText>
        <ItemText jc={'center'} style={{ padding: '10px' }}>
          <HyperLink
            href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TextSpan t3s light bold>
              We&apos;re hiring!
            </TextSpan>
          </HyperLink>
        </ItemText>
        <ItemText jc={'center'} style={{ padding: '10px' }}>
          <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/terms'}>
            <TextSpan t3s light>
              Terms &amp; Conditions
            </TextSpan>
          </SidebarItem>
        </ItemText>
      </ItemList>
      <ItemText jc={'center'} style={{ padding: '0', gap: '60px' }}>
        <HyperLink
          href={'https://discord.gg/7v8qsyepfu'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledDiscord size={20} />
          </SidebarText>
        </HyperLink>
        <HyperLink
          href={'https://twitter.com/solacefi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledTwitter size={20} />
          </SidebarText>
        </HyperLink>
        <HyperLink
          href={'https://github.com/solace-fi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledGithub size={20} />
          </SidebarText>
        </HyperLink>
        <HyperLink
          href={'https://medium.com/solace-fi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledMedium size={20} />
          </SidebarText>
        </HyperLink>
      </ItemText>
      <ThemeButton pt={10} pb={10} light />
      <NavButton light onClick={() => handleIsOpen(!isOpen)}>
        <StyledMenu size={40} />
      </NavButton>
    </TopNav>
  )
}
