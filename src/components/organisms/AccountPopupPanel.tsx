import { useWeb3React } from '@web3-react/core'
import makeBlockie from 'ethereum-blockies-base64'
import React, { useState } from 'react'
import { useENS } from '../../hooks/wallet/useENS'
import { Button } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { StyledArrowIosBackOutline, StyledLinkExternal, StyledMoon, StyledSun } from '../atoms/Icon'
import { CopyButton } from '../molecules/CopyButton'
import { WalletList } from '../molecules/WalletList'
// import { RecentActivityTable } from './RecentActivityTable'
import { useCachedData } from '../../context/CachedDataManager'
import { useGeneral } from '../../context/GeneralManager'
import { useWallet } from '../../context/WalletManager'
import { Text, TextSpan } from '../atoms/Typography'
import { shortenAddress } from '../../utils/formatting'
import { Flex, Scrollable } from '../atoms/Layout'
import { UserImage } from '../atoms/User'
import { ExplorerscanApi } from '../../constants/enums'
import { getExplorerItemUrl } from '../../utils/explorer'
import { HyperLink } from '../atoms/Link'
import { useNetwork } from '../../context/NetworkManager'

export function AccountPopupPanel(): JSX.Element {
  const { appTheme, toggleTheme } = useGeneral()

  const name = useENS()
  const { account } = useWeb3React()
  const { accountModal } = useCachedData()
  const { disconnect } = useWallet()
  const { activeNetwork } = useNetwork()

  const [showCopyTip, setShowCopyTip] = useState(false)
  const [showExploreTip, setShowExploreTip] = useState(false)
  const [showThemeTip, setShowThemeTip] = useState(false)

  const [panelState, setPanelState] = useState<'start' | 'wallet' | 'tx'>('start')

  return (
    <>
      {accountModal && (
        <div style={{ position: 'fixed', top: '72px', right: '20px', zIndex: '1000' }}>
          <Card>
            <Flex col>
              {account && (
                <Flex itemsCenter gap={5} mb={20} justifyCenter>
                  <UserImage width={25} height={25}>
                    <img src={makeBlockie(account)} alt={'account'} />
                  </UserImage>
                  <Text t4 semibold>
                    {name ?? shortenAddress(account)}
                  </Text>
                  <Flex gap={5}>
                    <CopyButton
                      onMouseEnter={() => setShowCopyTip(true)}
                      onMouseLeave={() => setShowCopyTip(false)}
                      toCopy={account}
                      width={30}
                      height={30}
                      style={{ position: 'relative' }}
                      noborder
                    >
                      {showCopyTip && (
                        <TextSpan t6 style={{ position: 'absolute', top: '30px' }}>
                          Copy
                        </TextSpan>
                      )}
                    </CopyButton>
                    <Button
                      onMouseEnter={() => setShowExploreTip(true)}
                      onMouseLeave={() => setShowExploreTip(false)}
                      width={30}
                      height={30}
                      style={{ position: 'relative' }}
                      noborder
                    >
                      <Text>
                        <HyperLink
                          href={getExplorerItemUrl(activeNetwork.explorer.url, account, ExplorerscanApi.ADDRESS)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <StyledLinkExternal size={20} />
                        </HyperLink>
                      </Text>
                      {showExploreTip && (
                        <TextSpan t6 style={{ position: 'absolute', top: '30px' }}>
                          Explorer
                        </TextSpan>
                      )}
                    </Button>
                  </Flex>
                </Flex>
              )}
              {panelState == 'start' && (
                <Flex col gap={10}>
                  {/* {account && <Button onClick={() => setPanelState('tx')}>Recent Activity</Button>} */}
                  <Button onClick={() => setPanelState('wallet')}>
                    <Text>{account ? 'Change Wallet' : 'Connect Wallet'}</Text>
                  </Button>
                </Flex>
              )}
              {panelState == 'wallet' && (
                <Flex col itemsCenter gap={10} widthP={100}>
                  <Flex gap={10}>
                    <Button width={35} onClick={() => setPanelState('start')}>
                      <StyledArrowIosBackOutline size={20} />
                    </Button>
                    <Button onClick={disconnect}>
                      <Text regular>Disconnect</Text>
                    </Button>
                  </Flex>
                  <Scrollable maxMobileHeight={'40vh'}>
                    <WalletList />
                  </Scrollable>
                </Flex>
              )}
              {panelState == 'tx' && (
                <Flex col itemsCenter gap={10} widthP={100}>
                  <Button width={35} onClick={() => setPanelState('start')}>
                    <StyledArrowIosBackOutline size={20} />
                  </Button>
                  {/* <RecentActivityTable /> */}
                </Flex>
              )}
              <Flex justifyCenter my={20}>
                <Button
                  onClick={toggleTheme}
                  onMouseEnter={() => setShowThemeTip(true)}
                  onMouseLeave={() => setShowThemeTip(false)}
                  width={30}
                  height={30}
                  style={{ position: 'relative' }}
                  noborder
                >
                  {appTheme == 'light' ? <StyledSun /> : <StyledMoon />}
                  {showThemeTip && (
                    <TextSpan t6 style={{ position: 'absolute', top: '30px' }}>
                      Theme
                    </TextSpan>
                  )}
                </Button>
              </Flex>
            </Flex>
          </Card>
        </div>
      )}
    </>
  )
}

export function AccountPopupPanelMobile(): JSX.Element {
  const { appTheme, toggleTheme } = useGeneral()

  const name = useENS()
  const { account } = useWeb3React()
  const { accountModal } = useCachedData()
  const { disconnect } = useWallet()
  const { activeNetwork } = useNetwork()

  const [panelState, setPanelState] = useState<'start' | 'wallet' | 'tx'>('start')

  return (
    <>
      {accountModal && (
        <div style={{ position: 'fixed', top: '65px', zIndex: '1000', width: '100%' }}>
          <Card style={{ borderRadius: '0' }}>
            <Flex col>
              {account && (
                <Flex itemsCenter gap={5} mb={20} justifyCenter>
                  <UserImage width={25} height={25}>
                    <img src={makeBlockie(account)} alt={'account'} />
                  </UserImage>
                  <Text t4 semibold>
                    {name ?? shortenAddress(account)}
                  </Text>
                  <Flex gap={5}>
                    <CopyButton
                      toCopy={account}
                      width={30}
                      height={30}
                      style={{ position: 'relative' }}
                      noborder
                    ></CopyButton>
                    <Button width={30} height={30} style={{ position: 'relative' }} noborder>
                      <Text>
                        <HyperLink
                          href={getExplorerItemUrl(activeNetwork.explorer.url, account, ExplorerscanApi.ADDRESS)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <StyledLinkExternal size={20} />
                        </HyperLink>
                      </Text>
                    </Button>
                  </Flex>
                </Flex>
              )}
              {panelState == 'start' && (
                <Flex col gap={10}>
                  {/* {account && <Button onClick={() => setPanelState('tx')}>Recent Activity</Button>} */}
                  <Button onClick={() => setPanelState('wallet')}>
                    <Text>{account ? 'Change Wallet' : 'Connect Wallet'}</Text>
                  </Button>
                </Flex>
              )}
              {panelState == 'wallet' && (
                <Flex col itemsCenter gap={10} widthP={100}>
                  <Flex gap={10}>
                    <Button width={35} onClick={() => setPanelState('start')}>
                      <StyledArrowIosBackOutline size={20} />
                    </Button>
                    <Button onClick={disconnect}>
                      <Text regular>Disconnect</Text>
                    </Button>
                  </Flex>
                  <Scrollable maxMobileHeight={'40vh'}>
                    <WalletList />
                  </Scrollable>
                </Flex>
              )}
              {panelState == 'tx' && (
                <Flex col itemsCenter gap={10} widthP={100}>
                  <Button width={35} onClick={() => setPanelState('start')}>
                    <StyledArrowIosBackOutline size={20} />
                  </Button>
                  {/* <RecentActivityTable /> */}
                </Flex>
              )}
              <Flex justifyCenter mt={20}>
                <Button onClick={toggleTheme} height={30} style={{ position: 'relative' }} noborder>
                  {appTheme == 'light' ? <StyledSun size={30} /> : <StyledMoon size={30} />}
                </Button>
              </Flex>
            </Flex>
          </Card>
        </div>
      )}
    </>
  )
}
