/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils
    import resources

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
import { useGeneral } from '../../context/GeneralProvider'
import { useNotifications } from '../../context/NotificationsManager'

/* import constants */
import { BKPT_3, BKPT_NAVBAR } from '../../constants'
import { SystemNotice } from '../../constants/enums'

/* import components */
import { SidebarItem, TopNav, ItemText, ItemList, SidebarText } from '../atoms/Navbar'
import { NavButton, Button } from '../atoms/Button'
import { Logo, MiniLogo } from '../molecules/Logo'
import {
  StyledDashboard,
  StyledMedium,
  StyledMenu,
  StyledDiscord,
  StyledGithub,
  StyledTwitter,
  StyledFileShield,
  StyledCoinStack,
  StyledCommunity,
  StyledDocuments,
  StyledDocumentText,
  StyledWork,
  StyledLockFile,
} from '../atoms/Icon'
import { Text, TextSpan } from '../atoms/Typography'
import { StyledLink } from '../atoms/Link'
import { ThemeButton } from '../molecules/ThemeButton'
import { FlexCol, FlexRow, HorizRule } from '../atoms/Layout'
import { MiniUserAccount, UserAccount } from '../molecules/Account'
import { StyledNavTooltip } from '../molecules/Tooltip'
import { AuditToast } from '../molecules/Toast'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */

/* import resources */
import AlchemyBadgeLight from '../../resources/svg/alchemy-badge-light.svg'
import AlchemyBadgeDark from '../../resources/svg/alchemy-badge-dark.svg'

export const SideNavbar: React.FC = () => {
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
          <StyledNavTooltip id={'dashboard-nav'} tip={'Dashboard'}>
            <ItemText>
              <SidebarItem to={'/dashboard'} style={miniNavbarMarginSet}>
                <Text info={location.pathname == '/dashboard'} light={lightText}>
                  {width > BKPT_3 ? 'Dashboard' : <StyledDashboard size={30} />}
                </Text>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'buy-cover-nav'} tip={'Buy Cover'}>
            <ItemText>
              <SidebarItem to={'/quote'} style={miniNavbarMarginSet}>
                <Text info={location.pathname == '/quote'} light={lightText}>
                  {width > BKPT_3 ? 'Buy Cover' : <StyledFileShield size={30} />}
                </Text>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'invest-nav'} tip={'Invest'}>
            <ItemText>
              <SidebarItem to={'/invest'} style={miniNavbarMarginSet}>
                <Text info={location.pathname == '/invest'} light={lightText}>
                  {width > BKPT_3 ? 'Invest' : <StyledCoinStack size={30} />}
                </Text>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'govern-nav'} tip={'Govern'}>
            <ItemText>
              <SidebarItem to={'/govern'} style={miniNavbarMarginSet}>
                <Text info={location.pathname == '/govern'} light={lightText}>
                  {width > BKPT_3 ? 'Govern' : <StyledCommunity size={30} />}
                </Text>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
        </ItemList>
        <div style={{ flex: '1 1' }}></div>
        <ItemList>
          <StyledNavTooltip id={'docs-nav'} tip={'Docs'}>
            <ItemText>
              <StyledLink
                href={'https://docs.solace.fi/'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t4 light={lightText}>
                    {width > BKPT_3 ? 'Docs' : <StyledDocuments size={30} />}
                  </TextSpan>
                </SidebarText>
              </StyledLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'whitepaper-nav'} tip={'Whitepaper'}>
            <ItemText>
              <StyledLink
                href={'https://whitepaper.solace.fi/'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t4 light={lightText}>
                    {width > BKPT_3 ? 'Whitepaper' : <StyledDocumentText size={30} />}
                  </TextSpan>
                </SidebarText>
              </StyledLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'jobs-nav'} tip={`We\'re hiring!`}>
            <ItemText>
              <StyledLink
                href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t4 light={lightText} bold>
                    {width > BKPT_3 ? `We\'re hiring!` : <StyledWork size={30} />}
                  </TextSpan>
                </SidebarText>
              </StyledLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'terms-nav'} tip={'Terms & Conditions'}>
            <ItemText>
              <SidebarItem to={'/terms'} style={{ ...miniNavbarMarginSet }}>
                <TextSpan t4 light={lightText}>
                  {width > BKPT_3 ? 'Terms & Conditions' : <StyledLockFile size={30} />}
                </TextSpan>
              </SidebarItem>
            </ItemText>
          </StyledNavTooltip>
          <HorizRule location={location} />
          {width > BKPT_3 ? (
            <ItemText style={{ padding: '4px 0', justifyContent: 'space-between' }}>
              <StyledLink
                href={'https://discord.gg/7v8qsyepfu'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledDiscord size={20} />
                </SidebarText>
              </StyledLink>
              <StyledLink
                href={'https://twitter.com/solacefi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledTwitter size={20} />
                </SidebarText>
              </StyledLink>
              <StyledLink
                href={'https://github.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledGithub size={20} />
                </SidebarText>
              </StyledLink>
              <StyledLink
                href={'https://medium.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <SidebarText style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledMedium size={20} />
                </SidebarText>
              </StyledLink>
            </ItemText>
          ) : (
            <ItemList>
              <StyledNavTooltip id={'discord-nav'} tip={'Discord'}>
                <ItemText>
                  <StyledLink
                    href={'https://discord.gg/7v8qsyepfu'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledDiscord size={20} />
                    </SidebarText>
                  </StyledLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'twitter-nav'} tip={'Twitter'}>
                <ItemText>
                  <StyledLink
                    href={'https://twitter.com/solacefi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledTwitter size={20} />
                    </SidebarText>
                  </StyledLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'github-nav'} tip={'GitHub'}>
                <ItemText>
                  <StyledLink
                    href={'https://github.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledGithub size={20} />
                    </SidebarText>
                  </StyledLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'medium-nav'} tip={'Medium'}>
                <ItemText>
                  <StyledLink
                    href={'https://medium.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0', ...miniNavbarMarginSet }}
                  >
                    <SidebarText style={{ opacity: '0.8' }} light={lightText}>
                      <StyledMedium size={20} />
                    </SidebarText>
                  </StyledLink>
                </ItemText>
              </StyledNavTooltip>
            </ItemList>
          )}
          <HorizRule location={location} />
          <StyledNavTooltip id={'theme-nav'} tip={'Change Theme'}>
            <ThemeButton light={lightText} width={0} />
          </StyledNavTooltip>
          {width > BKPT_3 && (
            <>
              {appTheme == 'light' && (
                <FlexRow style={{ justifyContent: 'center' }}>
                  <img src={AlchemyBadgeLight} style={{ width: '145px' }} />
                </FlexRow>
              )}
              {appTheme == 'dark' && (
                <FlexRow style={{ justifyContent: 'center' }}>
                  <img src={AlchemyBadgeDark} style={{ width: '145px' }} />
                </FlexRow>
              )}
            </>
          )}
        </ItemList>
      </div>
    </div>
  )
}

export const TopNavbar: React.FC = () => {
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
        <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/dashboard'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/dashboard'}>
            Dashboard
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/quote'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/quote'}>
            Buy Cover
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/invest'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/invest'}>
            Invest
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/govern'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/govern'}>
            Govern
          </Text>
        </SidebarItem>
      </ItemList>
      <HorizRule />
      <UserAccount light={location.pathname == '/'} />
      <ItemList>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <StyledLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
            <TextSpan t4 light>
              Docs
            </TextSpan>
          </StyledLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <StyledLink href={'https://whitepaper.solace.fi/'} target="_blank" rel="noopener noreferrer">
            <TextSpan t4 light>
              Whitepaper
            </TextSpan>
          </StyledLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <StyledLink
            href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TextSpan t4 light bold>
              We&apos;re hiring!
            </TextSpan>
          </StyledLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <SidebarItem onClick={() => handleIsOpen(!isOpen)} to={'/terms'}>
            <TextSpan t4 light>
              Terms &amp; Conditions
            </TextSpan>
          </SidebarItem>
        </ItemText>
      </ItemList>
      <ItemText style={{ padding: '0', justifyContent: 'center', gap: '60px' }}>
        <StyledLink
          href={'https://discord.gg/7v8qsyepfu'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledDiscord size={20} />
          </SidebarText>
        </StyledLink>
        <StyledLink
          href={'https://twitter.com/solacefi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledTwitter size={20} />
          </SidebarText>
        </StyledLink>
        <StyledLink
          href={'https://github.com/solace-fi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledGithub size={20} />
          </SidebarText>
        </StyledLink>
        <StyledLink
          href={'https://medium.com/solace-fi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ lineHeight: '0' }}
        >
          <SidebarText light>
            <StyledMedium size={20} />
          </SidebarText>
        </StyledLink>
      </ItemText>
      <ThemeButton pt={10} pb={10} light />
      <NavButton light onClick={() => handleIsOpen(!isOpen)}>
        <StyledMenu size={40} />
      </NavButton>
    </TopNav>
  )
}
