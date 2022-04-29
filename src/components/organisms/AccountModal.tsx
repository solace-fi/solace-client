/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    AccountModal function
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React, { useCallback } from 'react'
import makeBlockie from 'ethereum-blockies-base64'

/* import constants */
import { BKPT_5, BKPT_3, Z_TABLE } from '../../constants'
import { ExplorerscanApi } from '../../constants/enums'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Scrollable, Flex } from '../atoms/Layout'
import { HyperLink } from '../atoms/Link'
import { Loader } from '../atoms/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../atoms/Table'
import { Text } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { NetworkConnectButton } from '../molecules/NetworkConnectButton'
import { Card, CardContainer } from '../atoms/Card'
import { UserImage } from '../atoms/User'
import { Input } from '../atoms/Input'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { CopyButton } from '../molecules/CopyButton'

/* import hooks */
import { useTransactionDetails } from '../../hooks/api/useTransactionHistory'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'
import { shortenAddress } from '../../utils/formatting'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'
import { useENS } from '../../hooks/wallet/useENS'
import { useWeb3React } from '@web3-react/core'
import { SUPPORTED_WALLETS } from '../../wallet'

interface AccountModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const AccountModal: React.FC<AccountModalProps> = ({ closeModal, isOpen }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { activeNetwork } = useNetwork()
  const { localTransactions } = useCachedData()
  const { contractSources } = useContracts()
  const { account, connector } = useWeb3React()
  const name = useENS()
  const { width } = useWindowDimensions()
  const { txHistory } = useTransactionDetails()
  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Account'} disableCloseButton={false}>
      <CardContainer cardsPerRow={account ? 2 : 1} mb={10}>
        {account && connector && (
          <Card color1>
            <Flex stretch between justifyCenter>
              <Text t2 bold light>
                <UserImage width={30} height={30} pr={5} style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                  <img style={{ borderRadius: '10px' }} src={makeBlockie(account)} alt={'account'} />
                </UserImage>
                {name ?? shortenAddress(account)}
              </Text>
            </Flex>
            <Flex stretch between mb={5}>
              <Input widthP={100} readOnly value={account} light textAlignCenter />
            </Flex>
            <ButtonWrapper pt={10} pb={5} isColumn={width <= BKPT_3}>
              <CopyButton light toCopy={account} objectName={'address'} widthP={100} />
              <HyperLink
                href={getExplorerItemUrl(activeNetwork.explorer.url, account, ExplorerscanApi.ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button widthP={100} light style={{ whiteSpace: 'nowrap' }}>
                  View on {activeNetwork.explorer.name}
                </Button>
              </HyperLink>
            </ButtonWrapper>
          </Card>
        )}
        <Card color2>
          <Box transparent p={0}>
            <BoxItem>
              <BoxItemTitle light>Wallet</BoxItemTitle>
              <Text light t2 bold nowrap>
                {connector ? SUPPORTED_WALLETS.find((w) => w.connector === connector)?.name : 'Not Connected'}
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle light>Network</BoxItemTitle>
              <Text light t2 bold nowrap>
                {activeNetwork.name}
              </Text>
            </BoxItem>
          </Box>
          <ButtonWrapper pt={20} pb={5} isColumn={width <= BKPT_3}>
            <WalletConnectButton widthP={100} light />
            <NetworkConnectButton widthP={100} light />
          </ButtonWrapper>
        </Card>
      </CardContainer>
      {account && (
        <>
          <Text t2 bold mb={10}>
            Recent Transactions
          </Text>
          <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={30}>
            <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
              <TableHead sticky zIndex={Z_TABLE + 1}>
                <TableRow>
                  <TableHeader>Type</TableHeader>
                  {width > BKPT_5 && (
                    <>
                      {/* <TableHeader>Content</TableHeader> */}
                      <TableHeader>Time</TableHeader>
                    </>
                  )}
                  <TableHeader>Hash</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {localTransactions.map((pendingtx: any) => (
                  <TableRow isHighlight key={pendingtx.hash}>
                    <TableData
                      pl={width <= BKPT_3 ? 0 : undefined}
                      pr={width <= BKPT_3 ? 0 : undefined}
                      pt={5}
                      pb={5}
                      t4
                    >
                      <Text light>{pendingtx.type}</Text>
                    </TableData>
                    {width > BKPT_5 && (
                      <>
                        <TableData pt={5} pb={5} t4>
                          <Text light>{timeAgo(Number(Date.now()) * 1000)}</Text>
                        </TableData>
                      </>
                    )}
                    <TableData
                      pt={5}
                      pb={5}
                      t4
                      pl={width <= BKPT_3 ? 0 : undefined}
                      pr={width <= BKPT_3 ? 0 : undefined}
                    >
                      <HyperLink
                        href={getExplorerItemUrl(activeNetwork.explorer.url, pendingtx.hash, ExplorerscanApi.TX)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button light>{shortenAddress(pendingtx.hash)}</Button>
                      </HyperLink>
                    </TableData>
                  </TableRow>
                ))}
                {txHistory &&
                  txHistory.map((tx: any) => (
                    <TableRow key={tx.hash}>
                      <TableData
                        t4
                        pt={5}
                        pb={5}
                        pl={width <= BKPT_3 ? 0 : undefined}
                        pr={width <= BKPT_3 ? 0 : undefined}
                      >
                        {txHistory.length > 0 ? (
                          <Text error={tx.txreceipt_status != '1'}>{decodeInput(tx, contractSources)}</Text>
                        ) : (
                          <Loader width={10} height={10} />
                        )}
                      </TableData>
                      {width > BKPT_5 && (
                        <TableData pt={5} pb={5} t4>
                          {txHistory.length > 0 && (
                            <Text error={tx.txreceipt_status != '1'}>{timeAgo(Number(tx.timeStamp) * 1000)}</Text>
                          )}
                        </TableData>
                      )}
                      <TableData
                        t4
                        pt={5}
                        pb={5}
                        pl={width <= BKPT_3 ? 0 : undefined}
                        pr={width <= BKPT_3 ? 0 : undefined}
                      >
                        {txHistory.length > 0 && (
                          <HyperLink
                            href={getExplorerItemUrl(activeNetwork.explorer.url, tx.hash, ExplorerscanApi.TX)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button>{shortenAddress(tx.hash)} </Button>
                          </HyperLink>
                        )}
                      </TableData>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Scrollable>
        </>
      )}
    </Modal>
  )
}
