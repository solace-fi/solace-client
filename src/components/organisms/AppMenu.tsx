import React, { useRef, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Z_NAV } from '../../constants'
import { ModalCloseButton } from '../molecules/Modal'
import { Text } from '../atoms/Typography'
import { Flex, VerticalSeparator } from '../atoms/Layout'
import makeBlockie from 'ethereum-blockies-base64'
import { UserImage } from '../atoms/User'
import { StyledMoon, StyledSun, StyledWallet } from '../atoms/Icon'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { shortenAddress } from '../../utils/formatting'
import { useGeneral } from '../../context/GeneralManager'
import { Button } from '../atoms/Button'
import { useProvider } from '../../context/ProviderManager'
import { TransactionHistoryModal } from './TransactionHistoryModal'
import { HyperLink } from '../atoms/Link'
import { getExplorerItemUrl } from '../../utils/explorer'
import { ExplorerscanApi } from '../../constants/enums'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

const AppNav = styled.div<{ shouldShow: boolean }>`
  background-color: ${({ theme }) => theme.modal.base_color};
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 0;
  right: -100%;
  transition: 850ms;
  z-index: ${Z_NAV};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  ${(props) => props.shouldShow && `right: 0; transition: 350ms;`};
`

const AppNavItemList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;
`

const AppNavItemText = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  height: 40px;
`

const data = [
  {
    name: 'Cover',
    path: '/cover',
  },
  {
    name: 'Bond',
    path: '/bond',
  },
  {
    name: 'Stake',
    path: '/stake',
  },
  {
    name: 'Farms',
    path: '/farms',
  },
  {
    name: 'Govern',
    path: '/govern',
  },
  {
    name: 'Archive',
    path: '/archive',
  },
]

export const AppMenu = ({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) => {
  const location = useLocation()
  const { appTheme, toggleTheme } = useGeneral()
  const { width } = useWindowDimensions()
  const { openNetworkModal } = useProvider()
  const { account, activeWalletConnector, name, openWalletModal } = useWallet()
  const { activeNetwork } = useNetwork()
  const [txHistory, setTxHistory] = useState(false)
  const wrapperRef = useRef(null)

  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShow(false)
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }

  useOutsideAlerter(wrapperRef)

  return (
    <>
      <TransactionHistoryModal closeModal={() => setTxHistory(false)} isOpen={txHistory} />
      <AppNav ref={wrapperRef} shouldShow={show} style={{ width: `${Math.min(width, 250)}px` }}>
        <Flex between p={10}>
          <UserImage style={{ width: '40px', height: '40px' }}>
            {account ? <img src={makeBlockie(account)} alt={'account'} /> : <StyledWallet size={30} />}
          </UserImage>
          <div style={{ cursor: 'pointer' }} onClick={() => setShow(false)}>
            <svg width="30" height="40" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.5351 3.30802C19.1823 2.6609 19.1823 1.61172 18.5351 0.964604C17.888 0.317488 16.8388 0.317488 16.1917 0.964604L9.99894 7.15739L3.80678 0.965226C3.15966 0.31811 2.11048 0.31811 1.46336 0.965226C0.816248 1.61234 0.816248 2.66152 1.46336 3.30864L7.65553 9.5008L1.46496 15.6914C0.817846 16.3385 0.817845 17.3877 1.46496 18.0348C2.11208 18.6819 3.16126 18.6819 3.80838 18.0348L9.99894 11.8442L16.1901 18.0354C16.8372 18.6825 17.8864 18.6825 18.5335 18.0354C19.1807 17.3883 19.1807 16.3391 18.5335 15.692L12.3424 9.5008L18.5351 3.30802Z"
                fill={appTheme == 'dark' ? 'rgb(250, 250, 250)' : 'rgb(94, 94, 94)'}
              />
            </svg>
          </div>
        </Flex>
        <Flex col gap={10}>
          <Text t1 bold textAlignCenter mb={10}>
            My Wallet
          </Text>
          {account && (
            <HyperLink
              href={getExplorerItemUrl(activeNetwork.explorer.url, account, ExplorerscanApi.ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%' }}
            >
              <Text t4 textAlignCenter underline>
                {name ?? shortenAddress(account)}
              </Text>
            </HyperLink>
          )}
          <Flex center gap={5}>
            <Text t4 underline style={{ cursor: 'pointer' }} onClick={openWalletModal}>
              {activeWalletConnector ? activeWalletConnector.name : 'Not Connected'}
            </Text>
            <VerticalSeparator />
            <Text t4 underline style={{ cursor: 'pointer' }} onClick={openNetworkModal}>
              {activeNetwork.name}
            </Text>
          </Flex>
          {account && (
            <Text t4 textAlignCenter underline style={{ cursor: 'pointer' }} onClick={() => setTxHistory(true)}>
              Transaction History
            </Text>
          )}
        </Flex>
        <div style={{ flex: '1 1' }}></div>
        <Flex col>
          <Text t1 bold textAlignCenter mb={10}>
            My Solace
          </Text>
          <AppNavItemList>
            {data.map((item, index) => {
              return (
                <AppNavItemText key={index}>
                  <NavLink to={item.path}>
                    <Text
                      t3
                      warmgradient={location.pathname == item.path && appTheme == 'dark'}
                      techygradient={location.pathname == item.path && appTheme == 'light'}
                      bold
                    >
                      {item.name}
                    </Text>
                  </NavLink>
                </AppNavItemText>
              )
            })}
          </AppNavItemList>
        </Flex>
        <div style={{ flex: '1 1' }}></div>
        <Flex col mb={50}>
          <Flex center>
            <Button
              nohover
              noborder
              onClick={appTheme == 'dark' && toggleTheme}
              style={{ minWidth: '0', minHeight: '0' }}
            >
              <StyledSun size={20} />
            </Button>
            <VerticalSeparator />
            <Button
              nohover
              noborder
              onClick={appTheme == 'light' && toggleTheme}
              style={{ minWidth: '0', minHeight: '0' }}
            >
              {<StyledMoon size={20} />}
            </Button>
          </Flex>
        </Flex>
      </AppNav>
    </>
  )
}
