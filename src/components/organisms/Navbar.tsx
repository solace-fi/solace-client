import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { MobileNavPanelComponent, TopNav, MobileNavMenu } from '../atoms/Navbar'
import { Button } from '../atoms/Button'
import { StyledMenu, StyledMoon, StyledSun } from '../atoms/Icon'
import makeBlockie from 'ethereum-blockies-base64'
import { NavLink, useLocation } from 'react-router-dom'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useENS } from '../../hooks/wallet/useENS'
import { TabLabelLink, Text } from '../atoms/Typography'
import { Logo } from '../molecules/Logo'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { StyledNavLink } from '../atoms/Link'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import UnconnectedUser from '../../resources/svg/user_gradient.svg'
import { Card } from '../atoms/Card'
import { AccountPopupPanel, AccountPopupPanelMobile } from './AccountPopupPanel'
import { useOnClickOutside } from '../../hooks/internal/useOnClickOutside'
import { NetworkPopupPanel, NetworkPopupPanelMobile } from './NetworkPopupNanel'
import { Flex, VerticalSeparator } from '../atoms/Layout'
import { PageInfo } from '../../constants/types'
import { UserImage } from '../atoms/User'
import { shortenAddress } from '../../utils/formatting'

export function MobileNavPanel(props: {
  show: boolean
  setShow: (show: boolean) => void
  routeInfoArr: PageInfo[]
}): JSX.Element {
  const { appTheme, toggleTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const location = useLocation()

  return (
    <MobileNavPanelComponent shouldShow={props.show}>
      <MobileNavMenu>
        <Flex between m={20}>
          <ModalCloseButton lightColor={appTheme == 'dark'} onClick={() => props.setShow(false)} />
        </Flex>
        <Flex col gap={10} p={10}>
          {props.routeInfoArr.map((page) => (
            <NavLink
              key={page.to}
              to={page.to}
              onClick={() => {
                props.setShow(false)
              }}
            >
              <Card key={page.to}>
                <Flex justifyCenter>
                  <Text info={location.pathname == page.to}>{page.name}</Text>
                </Flex>
              </Card>
            </NavLink>
          ))}
        </Flex>
        <div style={{ flex: '1 1' }}></div>
        <Flex col mb={isMobile ? 80 : 50}>
          <Flex center gap={20}>
            <Button
              nohover
              onClick={appTheme == 'dark' ? toggleTheme : undefined}
              style={{ minWidth: '0', minHeight: '0' }}
              p={10}
            >
              <StyledSun size={30} />
            </Button>
            <VerticalSeparator />
            <Button
              nohover
              onClick={appTheme == 'light' ? toggleTheme : undefined}
              style={{ minWidth: '0', minHeight: '0' }}
              p={10}
            >
              <StyledMoon size={30} />
            </Button>
          </Flex>
        </Flex>
      </MobileNavMenu>
    </MobileNavPanelComponent>
  )
}

export function MobileNavbar(props: {
  routeInfoArr: PageInfo[]
  accountButtonRef: React.RefObject<HTMLDivElement>
  networkButtonRef: React.RefObject<HTMLDivElement>
}): JSX.Element {
  const { activeNetwork } = useNetwork()
  const { account } = useWeb3React()
  const { networkModal, accountModal, toggleAccountModal, toggleNetworkModal } = useCachedData()
  const [show, setShow] = useState(false)

  return (
    <>
      <MobileNavPanel show={show} setShow={setShow} routeInfoArr={props.routeInfoArr} />
      <Flex between>
        <Button nohover onClick={() => setShow(!show)} noborder>
          <Text>
            <StyledMenu size={40} />
          </Text>
        </Button>
        <Flex gap={10} pr={20}>
          <span ref={props.networkButtonRef}>
            <Button
              p={4}
              style={{ borderRadius: '28px', minWidth: 'unset' }}
              onClick={() => toggleNetworkModal(!networkModal)}
            >
              {activeNetwork.logo && <img src={activeNetwork.logo} width={30} height={30} />}
            </Button>
          </span>
          <span ref={props.accountButtonRef}>
            <Button
              nohover
              noborder
              onClick={() => toggleAccountModal(!accountModal)}
              style={{ borderRadius: '28px', minWidth: 'unset' }}
            >
              {account ? (
                <UserImage width={35} height={35} style={{ margin: 'auto' }}>
                  <img src={makeBlockie(account)} alt={'account'} />
                </UserImage>
              ) : (
                <img src={UnconnectedUser} />
              )}
            </Button>
          </span>
        </Flex>
      </Flex>
    </>
  )
}

export function FullNavbar(props: {
  routeInfoArr: PageInfo[]
  accountButtonRef: React.RefObject<HTMLDivElement>
  networkButtonRef: React.RefObject<HTMLDivElement>
}): JSX.Element {
  const { account } = useWeb3React()
  const name = useENS()
  const { activeNetwork } = useNetwork()
  const [scrollPosition, setScrollPosition] = useState(0)
  const location = useLocation()
  const { networkModal, accountModal, toggleAccountModal, toggleNetworkModal } = useCachedData()

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset
      setScrollPosition(position)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <Flex stretch between px={20}>
        <Flex gap={20} itemsCenter>
          <Logo location={location} />
          <Flex gap={20}>
            {props.routeInfoArr.map((page) => (
              <Fragment key={page.to}>
                <TabLabelLink t4 selected={location.pathname == page.to}>
                  <StyledNavLink to={page.to}>{page.name}</StyledNavLink>
                </TabLabelLink>
              </Fragment>
            ))}
          </Flex>
        </Flex>
        <Flex gap={10} itemsCenter>
          <span ref={props.networkButtonRef}>
            <Button
              p={8}
              style={{ borderRadius: '28px', minWidth: 'unset' }}
              onClick={() => toggleNetworkModal(!networkModal)}
            >
              <Flex>
                {activeNetwork.logo && (
                  <img src={activeNetwork.logo} width={30} height={30} style={{ marginRight: '2px' }} />
                )}
                <Text nowrap autoAlignVertical>
                  {activeNetwork.name}
                </Text>
              </Flex>
            </Button>
          </span>
          <span ref={props.accountButtonRef}>
            <Button
              p={8}
              style={{ borderRadius: '28px', minWidth: 'unset' }}
              onClick={() => toggleAccountModal(!accountModal)}
            >
              <Flex between gap={5} itemsCenter>
                {account ? (
                  <UserImage width={30} height={30} style={{ margin: 'auto' }}>
                    <img src={makeBlockie(account)} alt={'account'} />
                  </UserImage>
                ) : (
                  <img src={UnconnectedUser} />
                )}
                {scrollPosition <= 40 &&
                  (account ? (
                    <Flex col around>
                      <Text textAlignLeft t4>
                        {name ?? shortenAddress(account)}
                      </Text>
                    </Flex>
                  ) : (
                    <Flex col around>
                      <Text textAlignLeft>Not connected</Text>
                    </Flex>
                  ))}
              </Flex>
            </Button>
          </span>
        </Flex>
      </Flex>
    </>
  )
}

export function Navbar({ routeInfoArr }: { routeInfoArr: PageInfo[] }): JSX.Element {
  const { isSmallerMobile, isMobile } = useWindowDimensions()
  const { accountModal, networkModal, toggleAccountModal, toggleNetworkModal } = useCachedData()

  const accountButtonRef = useRef<HTMLDivElement>(null)
  const networkButtonRef = useRef<HTMLDivElement>(null)
  const accountPanelRef = useRef<HTMLDivElement>(null)
  const networkPanelRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(accountButtonRef, accountModal ? () => toggleAccountModal(false) : undefined, [accountPanelRef])
  useOnClickOutside(networkButtonRef, networkModal ? () => toggleNetworkModal(false) : undefined, [networkPanelRef])

  return (
    <TopNav>
      <span ref={accountPanelRef}>{!isMobile ? <AccountPopupPanel /> : <AccountPopupPanelMobile />}</span>
      <span ref={networkPanelRef}>{!isMobile ? <NetworkPopupPanel /> : <NetworkPopupPanelMobile />}</span>
      {isSmallerMobile || isMobile ? (
        <MobileNavbar
          routeInfoArr={routeInfoArr}
          accountButtonRef={accountButtonRef}
          networkButtonRef={networkButtonRef}
        />
      ) : (
        <FullNavbar
          routeInfoArr={routeInfoArr}
          accountButtonRef={accountButtonRef}
          networkButtonRef={networkButtonRef}
        />
      )}
    </TopNav>
  )
}
