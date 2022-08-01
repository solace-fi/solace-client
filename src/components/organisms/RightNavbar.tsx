import React, { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Z_NAV } from '../../constants'
import { Text, TextSpan } from '../atoms/Typography'
import { Flex, ShadowDiv, VerticalSeparator } from '../atoms/Layout'
import makeBlockie from 'ethereum-blockies-base64'
import { UserImage } from '../atoms/User'
import { StyledMoon, StyledSun } from '../atoms/Icon'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useCachedData } from '../../context/CachedDataManager'
import { shortenAddress, truncateValue } from '../../utils/formatting'
import { useGeneral } from '../../context/GeneralManager'
import { Button } from '../atoms/Button'
import { useProvider } from '../../context/ProviderManager'
import { HyperLink } from '../atoms/Link'
import { getExplorerItemUrl } from '../../utils/explorer'
import { ExplorerscanApi } from '../../constants/enums'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useSolaceBalance } from '../../hooks/balance/useBalance'
import { useXSLocker } from '../../hooks/stake/useXSLocker'
import { useContracts } from '../../context/ContractsManager'
import useCopyClipboard from '../../hooks/internal/useCopyToClipboard'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'
import UserWhite from '../../resources/svg/user_white.svg'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { useWeb3React } from '@web3-react/core'
import { useENS } from '../../hooks/wallet/useENS'

const RightAppNav = styled.div<{ shouldShow: boolean }>`
  background-color: ${({ theme }) => theme.modal.base_color};
  width: 375px;
  position: fixed;
  top: 0;
  z-index: ${Z_NAV};
  ${(props) => (props.shouldShow ? `right: 0%; transition: 350ms;` : `right: -100%; transition: 350ms;`)};
`

const RightAppNavGradient = styled.div<{ showSettings: boolean }>`
  background: ${(props) => (props.showSettings ? props.theme.box.bg_color_2 : null)};
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const AppButton = styled(Button)`
  background: ${(props) => props.theme.box.bg_color_2};
`

const RightAppNavItemList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;
`

const RightAppNavItemText = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  height: 40px;
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

export const AppMenu = ({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) => {
  const location = useLocation()
  const { appTheme, toggleTheme } = useGeneral()
  const { version } = useCachedData()
  const { width, isMobile } = useWindowDimensions()
  const { openNetworkModal, latestBlock } = useProvider()
  const { account } = useWeb3React()
  const name = useENS()
  const { openWalletModal } = useWallet()
  const { activeNetwork } = useNetwork()
  const [showWalletSettings, setShowWalletSettings] = useState(false)
  const fetching = useRef(false)

  const wrapperRef = useRef(null)
  const { contractSources } = useContracts()
  const [isCopied, setCopied] = useCopyClipboard()

  const solaceBalance = useSolaceBalance()
  const { getUserLockerBalances } = useXSLocker()
  const [userLockInfo, setUserLockInfo] = useState({
    stakedBalance: '0',
    lockedBalance: '0',
    unlockedBalance: '0',
    successfulFetch: true,
  })

  const _getUserLocks = useCallback(async () => {
    if (!account || fetching.current) return
    fetching.current = true
    const userLockData = await getUserLockerBalances(account)
    setUserLockInfo(userLockData)
    fetching.current = false
  }, [account])

  useEffect(() => {
    _getUserLocks()
  }, [account, version, _getUserLocks])

  useEffect(() => {
    if (userLockInfo.successfulFetch) return
    _getUserLocks()
  }, [latestBlock, userLockInfo.successfulFetch, _getUserLocks])

  useEffect(() => {
    if (!show) setShowWalletSettings(false)
  }, [show])

  useEffect(() => {
    if (!account) setShowWalletSettings(false)
  }, [account])

  return (
    <>
      <RightAppNav ref={wrapperRef} shouldShow={show} style={{ width: `${Math.min(width, 375)}px` }}>
        <ShadowDiv>
          <RightAppNavGradient showSettings={showWalletSettings}>
            <Flex between pt={60} pl={30} pr={30} pb={30}>
              <ShadowDiv style={{ borderRadius: '28px' }}>
                <AppButton
                  nohover
                  noborder
                  secondary
                  p={8}
                  style={{ borderRadius: '28px' }}
                  onClick={() => setShowWalletSettings(!showWalletSettings)}
                >
                  <Flex between gap={5} itemsCenter>
                    {account ? (
                      <SolaceGradientCircle>
                        <UserImage style={{ width: '30px', height: '30px' }}>
                          <img src={makeBlockie(account)} alt={'account'} />
                        </UserImage>
                      </SolaceGradientCircle>
                    ) : (
                      <img src={UserWhite} />
                    )}
                    {account ? (
                      <Flex col around>
                        <Text light textAlignLeft t4>
                          {name ?? shortenAddress(account)}
                        </Text>
                        <Flex>
                          {activeNetwork.logo && (
                            <img src={activeNetwork.logo} width={20} height={20} style={{ marginRight: '2px' }} />
                          )}
                          <Text light t5s nowrap autoAlignVertical>
                            {activeNetwork.name}
                          </Text>
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex col around>
                        <Text light textAlignLeft t5s>
                          Not connected
                        </Text>
                        <Text light textAlignLeft t4>
                          <Flex>
                            {activeNetwork.logo && (
                              <img src={activeNetwork.logo} width={20} height={20} style={{ marginRight: '2px' }} />
                            )}
                            <Text light t5s nowrap autoAlignVertical>
                              {activeNetwork.name}
                            </Text>
                          </Flex>
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </AppButton>
              </ShadowDiv>
              <div style={{ cursor: 'pointer' }} onClick={() => setShow(false)}>
                <svg width="30" height="40" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.5351 3.30802C19.1823 2.6609 19.1823 1.61172 18.5351 0.964604C17.888 0.317488 16.8388 0.317488 16.1917 0.964604L9.99894 7.15739L3.80678 0.965226C3.15966 0.31811 2.11048 0.31811 1.46336 0.965226C0.816248 1.61234 0.816248 2.66152 1.46336 3.30864L7.65553 9.5008L1.46496 15.6914C0.817846 16.3385 0.817845 17.3877 1.46496 18.0348C2.11208 18.6819 3.16126 18.6819 3.80838 18.0348L9.99894 11.8442L16.1901 18.0354C16.8372 18.6825 17.8864 18.6825 18.5335 18.0354C19.1807 17.3883 19.1807 16.3391 18.5335 15.692L12.3424 9.5008L18.5351 3.30802Z"
                    fill={appTheme == 'dark' || showWalletSettings ? 'rgb(250, 250, 250)' : 'rgb(94, 94, 94)'}
                  />
                </svg>
              </div>
            </Flex>
            {!showWalletSettings && (
              <>
                {account && (
                  <>
                    <Flex col mt={10} gap={10}>
                      <Text t1 bold textAlignCenter mb={10}>
                        My Solace
                      </Text>
                      <Flex marginAuto gap={24}>
                        <Flex col>
                          <Text bold>My balance</Text>
                          <Text>
                            <TextSpan t3 bold>{`${truncateValue(solaceBalance, 1)} `}</TextSpan>
                            <TextSpan t4>{SOLACE_TOKEN.constants.symbol}</TextSpan>
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex col>
                          <Text bold>My stake</Text>
                          <Text>
                            <TextSpan t3 bold>{`${truncateValue(userLockInfo.stakedBalance, 1)} `}</TextSpan>
                            <TextSpan t4>{SOLACE_TOKEN.constants.symbol}</TextSpan>
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </>
                )}
                {!account && <div style={{ flex: '1 1' }}></div>}
                <Flex col mt={account ? 56 : 0}>
                  <RightAppNavItemList>
                    {data.map((item, index) => {
                      return (
                        <RightAppNavItemText key={index}>
                          <NavLink to={item.path} onClick={() => setShow(false)}>
                            <Text
                              t3
                              warmgradient={location.pathname == item.path && appTheme == 'dark'}
                              techygradient={location.pathname == item.path && appTheme == 'light'}
                            >
                              {item.name}
                            </Text>
                          </NavLink>
                        </RightAppNavItemText>
                      )
                    })}
                  </RightAppNavItemList>
                </Flex>
                <div style={{ flex: '1 1' }}></div>
                <Flex col mt={30} mb={isMobile ? 80 : 50}>
                  <Flex center>
                    <Button
                      nohover
                      noborder
                      onClick={appTheme == 'dark' ? toggleTheme : undefined}
                      style={{ minWidth: '0', minHeight: '0' }}
                    >
                      <StyledSun size={20} />
                    </Button>
                    <VerticalSeparator />
                    <Button
                      nohover
                      noborder
                      onClick={appTheme == 'light' ? toggleTheme : undefined}
                      style={{ minWidth: '0', minHeight: '0' }}
                    >
                      {<StyledMoon size={20} />}
                    </Button>
                  </Flex>
                </Flex>
              </>
            )}
            {showWalletSettings && (
              <>
                <Flex col mt={10} gap={10}>
                  <Text t1 bold textAlignCenter mb={10} light>
                    My Wallet
                  </Text>
                  <Flex col itemsCenter gap={20} mt={30} mb={30}>
                    <Text t3 light style={{ cursor: 'pointer' }} onClick={openNetworkModal}>
                      Switch Network
                    </Text>
                    <Text t3 light style={{ cursor: 'pointer' }} onClick={openWalletModal}>
                      {account ? 'Switch Wallet' : 'Connect Wallet'}
                    </Text>
                    {account && (
                      <>
                        <Text t3 light style={{ cursor: 'pointer' }} onClick={() => setCopied(account)}>
                          {isCopied ? 'Copied!' : 'Copy Wallet Address'}
                        </Text>
                        <Text t3 light>
                          <HyperLink
                            href={getExplorerItemUrl(activeNetwork.explorer.url, account, ExplorerscanApi.ADDRESS)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: '100%' }}
                          >
                            View on {activeNetwork.explorer.name}
                          </HyperLink>
                        </Text>
                      </>
                    )}
                  </Flex>
                </Flex>
              </>
            )}
          </RightAppNavGradient>
        </ShadowDiv>
      </RightAppNav>
    </>
  )
}
