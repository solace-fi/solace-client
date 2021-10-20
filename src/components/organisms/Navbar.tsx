/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks

    SideNavbar
      hooks

    TopNavbar
      hooks
      useEffect hooks

  *************************************************************************************/

/* import react */
import React, { Fragment, useEffect, useMemo, useState } from 'react'

/* import packages */
import { useLocation } from 'react-router'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'
import { useToasts } from '../../context/NotificationsManager'

/* import constants */
import { BKPT_3, BKPT_NAVBAR } from '../../constants'

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
import { HyperLink } from '../atoms/Link'
import { ThemeButton } from '../molecules/ThemeButton'
import { FlexCol, FlexRow, HorizRule } from '../atoms/Layout'
import { MiniUserAccount, UserAccount } from './Account'
import { StyledNavTooltip } from '../molecules/Tooltip'

import AlchemyBadgeLight from '../../resources/svg/alchemy-badge-light.svg'
import AlchemyBadgeDark from '../../resources/svg/alchemy-badge-dark.svg'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { SystemNotice } from '../../constants/enums'
import { AuditToast } from '../molecules/Toast'

interface SideNavbarProps {
  isMobile?: Boolean
}

export const SideNavbar: React.FC<SideNavbarProps> = ({ isMobile }) => {
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
  const lightText = useMemo(() => location.pathname == '/' || !!isMobile, [isMobile, location])

  return (
    <div
      style={{
        position: 'fixed',
        overflow: 'auto',
        top: '0',
        bottom: '0',
        display: 'flex',
        background: !!isMobile ? 'black' : 'transparent',
      }}
    >
      <div
        style={{
          padding: !!isMobile ? '10px 25px 0px 25px' : '40px 5px 0px 5px',
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
              <HyperLink
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
              </HyperLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'whitepaper-nav'} tip={'Whitepaper'}>
            <ItemText>
              <HyperLink
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
              </HyperLink>
            </ItemText>
          </StyledNavTooltip>
          <StyledNavTooltip id={'jobs-nav'} tip={'Jobs'}>
            <ItemText>
              <HyperLink
                href={'https://angel.co/company/solace-fi/jobs'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...miniNavbarMarginSet }}
              >
                <SidebarText>
                  <TextSpan t4 light={lightText}>
                    {width > BKPT_3 ? 'Jobs' : <StyledWork size={30} />}
                  </TextSpan>
                </SidebarText>
              </HyperLink>
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
  const { toastSettings, makeAppToast } = useToasts()

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (location && location.pathname && location.pathname != '/') {
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

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <TopNav isOpen={isOpen}>
      <Logo location={location} pl={10} />
      <ItemList>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/dashboard'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/dashboard'}>
            Dashboard
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/quote'}>
            Buy Cover
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/invest'}>
            Invest
          </Text>
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'} style={{ padding: '20px 0' }}>
          <Text light bold={location.pathname == '/govern'}>
            Govern
          </Text>
        </SidebarItem>
      </ItemList>
      <HorizRule />
      <UserAccount light={location.pathname == '/'} />
      <ItemList>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <HyperLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
            <TextSpan t4 light>
              Docs
            </TextSpan>
          </HyperLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <HyperLink href={'https://whitepaper.solace.fi/'} target="_blank" rel="noopener noreferrer">
            <TextSpan t4 light>
              Whitepaper
            </TextSpan>
          </HyperLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <HyperLink href={'https://angel.co/company/solace-fi/jobs'} target="_blank" rel="noopener noreferrer">
            <TextSpan t4 light>
              Jobs
            </TextSpan>
          </HyperLink>
        </ItemText>
        <ItemText style={{ padding: '10px', justifyContent: 'center' }}>
          <SidebarItem to={'/terms'}>
            <TextSpan t4 light>
              Terms &amp; Conditions
            </TextSpan>
          </SidebarItem>
        </ItemText>
      </ItemList>
      <ItemText style={{ padding: '0', justifyContent: 'center', gap: '60px' }}>
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
      <ThemeButton pt={10} light />
      <NavButton light onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu size={40} />
      </NavButton>
    </TopNav>
  )
}
