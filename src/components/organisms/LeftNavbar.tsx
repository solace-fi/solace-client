/* import packages */
import React, { Fragment, useMemo } from 'react'
import { useLocation } from 'react-router'

/* import managers */
import { useGeneral } from '../../context/GeneralManager'

/* import constants */
import { BKPT_3, BKPT_4, Z_NAV } from '../../constants'

/* import components */
import { ItemText, ItemList } from '../atoms/Navbar'
import { Button } from '../atoms/Button'
import { Logo, MiniLogo } from '../molecules/Logo'
import {
  StyledMedium,
  StyledDiscord,
  StyledGithub,
  StyledTwitter,
  StyledWork,
  StyledLockFile,
  StyledHelpCircle,
  StyledDocumentText,
} from '../atoms/Icon'
import { Text, TextSpan } from '../atoms/Typography'
import { HyperLink } from '../atoms/Link'
import { Flex } from '../atoms/Layout'
import { StyledNavTooltip } from '../molecules/Tooltip'

import defipulse from '../../resources/svg/defipulse.svg'

/* import resources */

import AlchemyBadgeLight from '../../resources/svg/alchemy-badge-light.svg'
import AlchemyBadgeDark from '../../resources/svg/alchemy-badge-dark.svg'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { BaseModalProps, FadeInAnimation } from '../atoms/Modal'
import { LogoBase } from '../atoms/Logo'
import whiteLogo from '../../resources/svg/solace-logo-white.svg'
import { ThinScrollbarCss } from '../atoms/Scrollbar/ThinScrollbar'

const NavItemList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;
`

const NavItemText = styled.li`
  display: flex;
  list-style: none;
  line-height: 40px;
`

const LeftAppNav = styled.div<{ shouldShow: boolean }>`
  background: ${({ theme }) => theme.body.layout_bg_color};
  display: flex;
  position: fixed;
  overflow: auto;
  top: 0;
  bottom: 0;
  z-index: ${Z_NAV};
  ${(props) => (props.shouldShow ? `left: 0%; transition: 350ms;` : `left: -100%; transition: 350ms;`)};
  ${ThinScrollbarCss}
  overflow-x: hidden;
`

const data = [
  {
    name: 'Vote',
    path: '/vote',
  },
  {
    name: 'Lock',
    path: '/lock',
  },
]

export const InfoSideNavbar = ({ show }: { show: boolean }): JSX.Element => {
  const { appTheme, rightSidebar } = useGeneral()
  const location = useLocation()
  const { width } = useWindowDimensions()
  const lightText = useMemo(() => location.pathname == '/', [location])

  const widthThreshold = useMemo(() => width > (rightSidebar ? BKPT_4 : BKPT_3), [width, rightSidebar])

  return (
    <LeftAppNav shouldShow={show}>
      <div
        style={{
          padding: `30px 5px 20px ${widthThreshold ? '30px' : '5px'}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {widthThreshold ? (
          <>
            <Logo location={location} mb={33} />
          </>
        ) : (
          <>
            <MiniLogo location={location} mb={33} style={{ marginLeft: 'auto', marginRight: 'auto' }} />
          </>
        )}
        <Flex col>
          <NavItemList>
            {data.map((item, index) => {
              return (
                <NavLink to={item.path} key={index}>
                  <NavItemText
                    style={{
                      cursor: 'pointer',
                      justifyContent: widthThreshold ? 'left' : 'center',
                      minHeight: 'unset',
                    }}
                  >
                    <TextSpan
                      t3
                      warmgradient={location.pathname == item.path && appTheme == 'dark'}
                      techygradient={location.pathname == item.path && appTheme == 'light'}
                    >
                      {item.name}
                    </TextSpan>
                  </NavItemText>
                </NavLink>
              )
            })}
          </NavItemList>
        </Flex>
        <div style={{ flex: '1 1', padding: '10px 0' }}></div>
        <Flex col marginAuto gap={10}>
          <StyledNavTooltip id={'jobs-nav'} tip={`We\'re hiring!`}>
            <HyperLink
              href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TextSpan t3s light={lightText} bold>
                {widthThreshold ? `We\'re hiring!` : <StyledWork size={30} />}
              </TextSpan>
            </HyperLink>
          </StyledNavTooltip>
          <StyledNavTooltip id={'docs-nav'} tip={`Docs`}>
            <HyperLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
              <TextSpan t3s light={lightText}>
                {widthThreshold ? `Docs` : <StyledDocumentText size={30} />}
              </TextSpan>
            </HyperLink>
          </StyledNavTooltip>
          <StyledNavTooltip id={'help-nav'} tip={`Help & Support`}>
            <HyperLink href={'https://discord.gg/7v8qsyepfu'} target="_blank" rel="noopener noreferrer">
              <TextSpan t3s light={lightText}>
                {widthThreshold ? `Help & Support` : <StyledHelpCircle size={30} />}
              </TextSpan>
            </HyperLink>
          </StyledNavTooltip>
          <StyledNavTooltip id={'terms-nav'} tip={'Terms & Conditions'}>
            <NavLink to={'/terms'}>
              <TextSpan t3s light={lightText}>
                {widthThreshold ? 'Terms & Conditions' : <StyledLockFile size={30} />}
              </TextSpan>
            </NavLink>
          </StyledNavTooltip>
        </Flex>
        <Flex col marginAuto gap={10}>
          {widthThreshold ? (
            <ItemText jc={'space-between'} style={{ padding: '4px 0' }}>
              <HyperLink
                href={'https://discord.gg/7v8qsyepfu'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <Text style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledDiscord size={20} />
                </Text>
              </HyperLink>
              <HyperLink
                href={'https://twitter.com/solacefi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <Text style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledTwitter size={20} />
                </Text>
              </HyperLink>
              <HyperLink
                href={'https://github.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <Text style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledGithub size={20} />
                </Text>
              </HyperLink>
              <HyperLink
                href={'https://medium.com/solace-fi'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <Text style={{ opacity: '0.8' }} light={location.pathname == '/'}>
                  <StyledMedium size={20} />
                </Text>
              </HyperLink>
              <HyperLink
                href={'https://www.defipulse.com/defi-list'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ lineHeight: '0' }}
              >
                <Text style={{ opacity: '0.8' }}>
                  <img
                    src={defipulse}
                    width={16}
                    height={16}
                    style={{ filter: location.pathname == '/' || appTheme == 'dark' ? 'unset' : 'invert(.6)' }}
                  />{' '}
                </Text>
              </HyperLink>
            </ItemText>
          ) : (
            <ItemList>
              <StyledNavTooltip id={'discord-nav'} tip={'Discord'}>
                <ItemText style={{ justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://discord.gg/7v8qsyepfu'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light={lightText}>
                      <StyledDiscord size={20} />
                    </Text>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'twitter-nav'} tip={'Twitter'}>
                <ItemText style={{ justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://twitter.com/solacefi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light={lightText}>
                      <StyledTwitter size={20} />
                    </Text>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'github-nav'} tip={'GitHub'}>
                <ItemText style={{ justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://github.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light={lightText}>
                      <StyledGithub size={20} />
                    </Text>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'medium-nav'} tip={'Medium'}>
                <ItemText style={{ justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://medium.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light={lightText}>
                      <StyledMedium size={20} />
                    </Text>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
              <StyledNavTooltip id={'defipulse-nav'} tip={'DefiPulse'}>
                <ItemText style={{ justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://www.defipulse.com/defi-list'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }}>
                      <img
                        src={defipulse}
                        width={16}
                        height={16}
                        style={{ filter: location.pathname == '/' || appTheme == 'dark' ? 'unset' : 'invert(.6)' }}
                      />
                    </Text>
                  </HyperLink>
                </ItemText>
              </StyledNavTooltip>
            </ItemList>
          )}
          {widthThreshold && (
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
        </Flex>
      </div>
    </LeftAppNav>
  )
}

export const MenuBg = styled.div<BaseModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${Z_NAV};
  ${(props) =>
    props.isOpen &&
    css`
      animation: ${FadeInAnimation} 300ms ease-in-out normal forwards;
    `}
  background: white;
`

export const MenuGradientBg = styled.div<BaseModalProps>`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: ${Z_NAV};
  ${(props) =>
    props.isOpen &&
    css`
      animation: ${FadeInAnimation} 300ms ease-in-out normal forwards;
    `}
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse 120% 150% at 60% 0, rgba(212, 120, 216, 1) 10%, rgba(212, 120, 216, 0) 50%),
    radial-gradient(ellipse 50% 150% at 40% 150%, rgba(243, 211, 126, 1) 20%, rgba(243, 211, 126, 0) 80%),
    radial-gradient(ellipse 50% 200% at 100% 50%, rgba(95, 93, 249, 1) 10%, rgba(95, 93, 249, 0) 90%),
    radial-gradient(ellipse 100% 200% at 0 100%, rgba(240, 77, 66, 1) 10%, rgba(240, 77, 66, 0) 100%);
`

export const MobileInfoSideNavbar: React.FC<{ show: boolean; setShow: (show: boolean) => void }> = ({
  show,
  setShow,
}) => {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()

  const widthThreshold = useMemo(() => (rightSidebar ? width > BKPT_4 : width > BKPT_3), [width, rightSidebar])

  return (
    <>
      {show && (
        <MenuBg isOpen={show}>
          <MenuGradientBg isOpen={show}>
            <Flex between col flex1 p={20}>
              <div>
                <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => setShow(false)}>
                  <svg width="30" height="40" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18.5351 3.30802C19.1823 2.6609 19.1823 1.61172 18.5351 0.964604C17.888 0.317488 16.8388 0.317488 16.1917 0.964604L9.99894 7.15739L3.80678 0.965226C3.15966 0.31811 2.11048 0.31811 1.46336 0.965226C0.816248 1.61234 0.816248 2.66152 1.46336 3.30864L7.65553 9.5008L1.46496 15.6914C0.817846 16.3385 0.817845 17.3877 1.46496 18.0348C2.11208 18.6819 3.16126 18.6819 3.80838 18.0348L9.99894 11.8442L16.1901 18.0354C16.8372 18.6825 17.8864 18.6825 18.5335 18.0354C19.1807 17.3883 19.1807 16.3391 18.5335 15.692L12.3424 9.5008L18.5351 3.30802Z"
                      fill={'rgb(250, 250, 250)'}
                    />
                  </svg>
                </div>
              </div>
              <ItemList>
                <Flex center ml={16} mb={40}>
                  <LogoBase>
                    <img src={whiteLogo} alt="Solace | Decentralized Coverage Protocol" />
                  </LogoBase>
                </Flex>
                {data.map((t, index) => {
                  return (
                    <Flex col key={index} my={10} itemsCenter>
                      <NavItemText>
                        <NavLink to={t.path}>
                          <Button
                            p={0}
                            nohover
                            noborder
                            style={{ cursor: 'pointer', justifyContent: widthThreshold ? 'left' : 'center' }}
                            onClick={() => setShow(false)}
                          >
                            <Text t3 light>
                              {t.name}
                            </Text>
                          </Button>
                        </NavLink>
                      </NavItemText>
                    </Flex>
                  )
                })}
              </ItemList>
              <Flex col style={{ margin: '0 auto 30px' }}>
                <ItemText style={{ height: '25px', justifyContent: 'center' }}>
                  <HyperLink
                    href={'https://www.notion.so/Solace-16cc777c403a46c8a2ffaba68008fcd9'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TextSpan t3s light bold>
                      {`We\'re hiring!`}
                    </TextSpan>
                  </HyperLink>
                </ItemText>
                <ItemText style={{ height: '25px', justifyContent: 'center' }}>
                  <HyperLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
                    <TextSpan t3s light bold>
                      {`Docs`}
                    </TextSpan>
                  </HyperLink>
                </ItemText>
                <ItemText style={{ height: '25px', justifyContent: 'center' }}>
                  <NavLink to={'/terms'} onClick={() => setShow(false)}>
                    <TextSpan t3s light>
                      {'Terms & Conditions'}
                    </TextSpan>
                  </NavLink>
                </ItemText>
                <ItemText jc={'space-between'} style={{ padding: '4px 0' }}>
                  <HyperLink
                    href={'https://discord.gg/7v8qsyepfu'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light>
                      <StyledDiscord size={20} />
                    </Text>
                  </HyperLink>
                  <HyperLink
                    href={'https://twitter.com/solacefi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light>
                      <StyledTwitter size={20} />
                    </Text>
                  </HyperLink>
                  <HyperLink
                    href={'https://github.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light>
                      <StyledGithub size={20} />
                    </Text>
                  </HyperLink>
                  <HyperLink
                    href={'https://medium.com/solace-fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }} light>
                      <StyledMedium size={20} />
                    </Text>
                  </HyperLink>
                  <HyperLink
                    href={'https://www.defipulse.com/defi-list'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ lineHeight: '0' }}
                  >
                    <Text style={{ opacity: '0.8' }}>
                      <img src={defipulse} width={16} height={16} />
                    </Text>
                  </HyperLink>
                </ItemText>
              </Flex>
            </Flex>
          </MenuGradientBg>
        </MenuBg>
      )}
    </>
  )
}
