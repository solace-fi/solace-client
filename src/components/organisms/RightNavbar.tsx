import React, { useRef, useState, useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { BKPT_3, BKPT_5, ZERO, Z_NAV, Z_TABLE } from '../../constants'
import { ModalCloseButton } from '../molecules/Modal'
import { Text, TextSpan } from '../atoms/Typography'
import { Flex, ShadowDiv, VerticalSeparator } from '../atoms/Layout'
import makeBlockie from 'ethereum-blockies-base64'
import { UserImage } from '../atoms/User'
import { StyledMoon, StyledSun, StyledWallet } from '../atoms/Icon'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { shortenAddress, truncateValue } from '../../utils/formatting'
import { useGeneral } from '../../context/GeneralManager'
import { Button } from '../atoms/Button'
import { useProvider } from '../../context/ProviderManager'
import { TransactionHistoryModal } from './TransactionHistoryModal'
import { HyperLink } from '../atoms/Link'
import { getExplorerItemUrl } from '../../utils/explorer'
import { ExplorerscanApi } from '../../constants/enums'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { UserLocksInfo } from '../../constants/types'
import { useSolaceBalance } from '../../hooks/balance/useBalance'
import { useUserLockData } from '../../hooks/stake/useXSLocker'
import { formatUnits } from 'ethers/lib/utils'
import { useContracts } from '../../context/ContractsManager'
import { useReadToken } from '../../hooks/contract/useToken'
import { useTransactionDetails } from '../../hooks/api/useTransactionHistory'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'
import { TableData, TableRow, Table, TableBody, TableHead, TableHeader } from '../atoms/Table'
import { Loader } from '../atoms/Loader'
import useCopyClipboard from '../../hooks/internal/useCopyToClipboard'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'

const AppNav = styled.div<{ shouldShow: boolean }>`
  background-color: ${({ theme }) => theme.modal.base_color};
  width: 375px;
  position: fixed;
  top: 0;
  right: -100%;
  transition: 850ms;
  z-index: ${Z_NAV};
  ${(props) => props.shouldShow && `right: 0; transition: 350ms;`};
`

const AppNavGradient = styled.div<{ showSettings: boolean }>`
  background: ${(props) => (props.showSettings ? props.theme.box.bg_color_2 : null)};
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const AppButton = styled(Button)`
  background: ${(props) => props.theme.box.bg_color_2};
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
  const { width, height } = useWindowDimensions()
  const { openNetworkModal } = useProvider()
  const { account, activeWalletConnector, name, openWalletModal } = useWallet()
  const { activeNetwork } = useNetwork()
  const { txHistory } = useTransactionDetails()
  const [showTxHistory, setShowTxHistory] = useState(false)
  const [showWalletSettings, setShowWalletSettings] = useState(false)

  const wrapperRef = useRef(null)
  const { latestBlock } = useProvider()
  const { keyContracts, contractSources } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)
  const [isCopied, setCopied] = useCopyClipboard()

  const solaceBalance = useSolaceBalance()
  const { getUserLocks } = useUserLockData()
  const [userLockInfo, setUserLockInfo] = useState<UserLocksInfo>({
    pendingRewards: ZERO,
    stakedBalance: ZERO,
    lockedBalance: ZERO,
    unlockedBalance: ZERO,
    yearlyReturns: ZERO,
    apr: ZERO,
  })

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account) return
      const userLockData = await getUserLocks(account)
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
  }, [account, latestBlock])

  useEffect(() => {
    if (!account) setShowWalletSettings(false)
  }, [account])

  return (
    <>
      <TransactionHistoryModal closeModal={() => setShowTxHistory(false)} isOpen={showTxHistory} />
      <AppNav ref={wrapperRef} shouldShow={show} style={{ width: `${Math.min(width, 375)}px` }}>
        <ShadowDiv>
          <AppNavGradient showSettings={showWalletSettings}>
            <Flex between p={30}>
              <ShadowDiv style={{ borderRadius: '28px' }}>
                <AppButton
                  nohover
                  noborder
                  secondary
                  p={8}
                  style={{ borderRadius: '28px' }}
                  onClick={account ? () => setShowWalletSettings(!showWalletSettings) : () => openWalletModal()}
                >
                  <Flex between gap={5} itemsCenter>
                    {account ? (
                      <SolaceGradientCircle>
                        <UserImage style={{ width: '30px', height: '30px' }}>
                          <img src={makeBlockie(account)} alt={'account'} />
                        </UserImage>
                      </SolaceGradientCircle>
                    ) : (
                      <Text light>
                        <StyledWallet size={30} />
                      </Text>
                    )}

                    {account ? (
                      <Flex col around>
                        <Text light textAlignLeft t4>
                          {name ?? shortenAddress(account)}
                        </Text>
                        <Flex>
                          {activeNetwork.logo && (
                            <img src={activeNetwork.logo} width={25} height={25} style={{ marginRight: '2px' }} />
                          )}
                          <Text light t5s nowrap mt={5} autoAlignVertical>
                            {activeNetwork.name}
                          </Text>
                        </Flex>
                      </Flex>
                    ) : (
                      <Text light t4>
                        Connect Wallet
                      </Text>
                    )}
                  </Flex>
                </AppButton>
              </ShadowDiv>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShow(false)
                  setShowWalletSettings(false)
                }}
              >
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
                            <TextSpan t4>{readSolaceToken.symbol}</TextSpan>
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex col>
                          <Text bold>My stake</Text>
                          <Text>
                            <TextSpan t3 bold>{`${truncateValue(
                              formatUnits(userLockInfo.stakedBalance, 18),
                              1
                            )} `}</TextSpan>
                            <TextSpan t4>{readSolaceToken.symbol}</TextSpan>
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </>
                )}
                {!account && <div style={{ flex: '1 1' }}></div>}
                <Flex col mt={account ? 56 : 0}>
                  <AppNavItemList>
                    {data.map((item, index) => {
                      return (
                        <AppNavItemText key={index}>
                          <NavLink to={item.path} onClick={() => setShow(false)}>
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
                <Flex col mt={30} mb={50}>
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
              </>
            )}
            {showWalletSettings && (
              <>
                {account && (
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
                          Switch Wallet
                        </Text>
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
                      </Flex>
                    </Flex>
                  </>
                )}
                <div style={{ flex: '1 1' }}></div>
                <Flex col gap={24}>
                  <Text t1 bold textAlignCenter mb={10} light>
                    My Recent Transactions
                  </Text>
                  {txHistory.length > 0 ? (
                    <Flex col>
                      <Flex stretch around pb={12}>
                        <Text light>Type</Text>
                        <Text light>Hash</Text>
                      </Flex>
                      {txHistory.slice(0, 5).map((tx: any) => (
                        <Flex stretch between pl={40} pr={40} pb={12} key={tx.hash}>
                          <Text light t4>
                            {decodeInput(tx, contractSources)}
                          </Text>
                          <HyperLink
                            href={getExplorerItemUrl(activeNetwork.explorer.url, tx.hash, ExplorerscanApi.TX)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Text light t4 underline>
                              {shortenAddress(tx.hash)}
                            </Text>
                          </HyperLink>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Text textAlignCenter light>
                      No transactions found
                    </Text>
                  )}
                  <Flex stretch evenly>
                    <Text mb={50} light underline style={{ cursor: 'pointer' }} onClick={() => setShowTxHistory(true)}>
                      View All Transactions
                    </Text>
                  </Flex>
                </Flex>
              </>
            )}
          </AppNavGradient>
        </ShadowDiv>
      </AppNav>
    </>
  )
}
