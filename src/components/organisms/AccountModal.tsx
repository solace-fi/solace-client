/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    TransactionHistoryModal function
      custom hooks
      local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import packages */
import makeBlockie from 'ethereum-blockies-base64'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { ExplorerscanApi } from '../../constants/enums'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { Scrollable } from '../atoms/Layout'
import { HyperLink } from '../atoms/Link'
import { Loader } from '../atoms/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../atoms/Table'
import { Heading2, Text, Text2 } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { NetworkConnectButton } from '../molecules/NetworkConnectButton'
import { Card, CardContainer } from '../atoms/Card'
import { FormCol, FormRow } from '../atoms/Form'
import { UserImage } from '../atoms/User'

/* import hooks */
import { useTransactionDetails } from '../../hooks/useTransactionHistory'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'
import { capitalizeFirstLetter, shortenAddress } from '../../utils/formatting'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'

interface AccountModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const AccountModal: React.FC<AccountModalProps> = ({ closeModal, isOpen }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { activeNetwork } = useNetwork()
  const { localTransactions } = useCachedData()
  const { contractSources } = useContracts()
  const { account, activeWalletConnector } = useWallet()
  const { width } = useWindowDimensions()
  const { txHistory, amounts } = useTransactionDetails()
  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])
  /************************************************************************************* 
    
  Render

  *************************************************************************************/
  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Account'} disableCloseButton={false}>
      <CardContainer cardsPerRow={2} mb={10}>
        <Card color1>
          <FormRow>
            <FormCol>
              <Text2>
                Network
                <UserImage style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                  <img src={activeNetwork.logo} alt={activeNetwork.name} height={32} />
                </UserImage>
              </Text2>
            </FormCol>
            <FormCol>
              <Heading2 high_em nowrap>
                {capitalizeFirstLetter(activeNetwork.name)}
              </Heading2>
            </FormCol>
          </FormRow>
          <NetworkConnectButton widthP={100} />
        </Card>
        <Card color2>
          <FormRow>
            <FormCol>
              <Text2>
                Wallet{' '}
                {activeWalletConnector && (
                  <UserImage style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                    <img src={activeWalletConnector.logo} alt={activeWalletConnector.name} height={32} />
                  </UserImage>
                )}{' '}
              </Text2>
            </FormCol>
            <FormCol>
              <Heading2 high_em nowrap>
                {account ? shortenAddress(account) : 'Not Connected'}
                {account && (
                  <>
                    <UserImage pl={5} style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                      <img src={makeBlockie(account)} alt={'account'} />
                    </UserImage>
                  </>
                )}
              </Heading2>
            </FormCol>
          </FormRow>
          <WalletConnectButton widthP={100} />
        </Card>
      </CardContainer>
      {account && (
        <>
          <Heading2 mb={10} high_em>
            Recent Transactions
          </Heading2>
          <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={30}>
            <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
              <TableHead sticky>
                <TableRow>
                  <TableHeader>Type</TableHeader>
                  {width > MAX_TABLET_SCREEN_WIDTH && (
                    <>
                      <TableHeader>Content</TableHeader>
                      <TableHeader>Time</TableHeader>
                    </>
                  )}
                  <TableHeader>Hash</TableHeader>
                  {width > MAX_TABLET_SCREEN_WIDTH && <TableHeader>Status</TableHeader>}
                </TableRow>
              </TableHead>
              <TableBody>
                {localTransactions.map((pendingtx: any) => (
                  <TableRow isHighlight key={pendingtx.hash}>
                    <TableData high_em pt={5} pb={5} t4>
                      {pendingtx.type}
                    </TableData>
                    {width > MAX_TABLET_SCREEN_WIDTH && (
                      <>
                        <TableData high_em pt={5} pb={5} t4>{`${pendingtx.value} ${pendingtx.unit}`}</TableData>
                        <TableData high_em pt={5} pb={5} t4>
                          {timeAgo(Number(Date.now()) * 1000)}
                        </TableData>
                      </>
                    )}
                    <TableData high_em pt={5} pb={5} t4>
                      <HyperLink
                        href={getExplorerItemUrl(activeNetwork.explorer.url, pendingtx.hash, ExplorerscanApi.TX)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button>{shortenAddress(pendingtx.hash)} </Button>
                      </HyperLink>
                    </TableData>
                    {width > MAX_TABLET_SCREEN_WIDTH && (
                      <TableData high_em pt={5} pb={5} t4>
                        <Text>{pendingtx.status}</Text>
                      </TableData>
                    )}
                  </TableRow>
                ))}
                {txHistory &&
                  txHistory.map((tx: any, i: number) => (
                    <TableRow key={tx.hash}>
                      <TableData
                        t4
                        high_em
                        error={tx.txreceipt_status != '1'}
                        pt={5}
                        pb={5}
                        pl={width <= MAX_MOBILE_SCREEN_WIDTH ? 0 : undefined}
                        pr={width <= MAX_MOBILE_SCREEN_WIDTH ? 0 : undefined}
                      >
                        {amounts.length > 0 ? (
                          decodeInput(tx, contractSources).function_name
                        ) : (
                          <Loader width={10} height={10} />
                        )}
                      </TableData>
                      {width > MAX_TABLET_SCREEN_WIDTH && (
                        <>
                          <TableData high_em pt={5} pb={5} t4>
                            {amounts.length > 0 && <Text error={tx.txreceipt_status != '1'}>{amounts[i]}</Text>}
                          </TableData>
                          <TableData high_em pt={5} pb={5} t4>
                            {amounts.length > 0 && (
                              <Text error={tx.txreceipt_status != '1'}>{timeAgo(Number(tx.timeStamp) * 1000)}</Text>
                            )}
                          </TableData>
                        </>
                      )}
                      <TableData
                        high_em
                        t4
                        pt={5}
                        pb={5}
                        pl={width <= MAX_MOBILE_SCREEN_WIDTH ? 0 : undefined}
                        pr={width <= MAX_MOBILE_SCREEN_WIDTH ? 0 : undefined}
                      >
                        {amounts.length > 0 && (
                          <HyperLink
                            href={getExplorerItemUrl(activeNetwork.explorer.url, tx.hash, ExplorerscanApi.TX)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button>{shortenAddress(tx.hash)} </Button>
                          </HyperLink>
                        )}
                      </TableData>
                      {width > MAX_TABLET_SCREEN_WIDTH && (
                        <TableData high_em pt={5} pb={5} t4>
                          {amounts.length > 0 && (
                            <Text error={tx.txreceipt_status != '1'}>
                              {tx.txreceipt_status == '1' ? 'Complete' : 'Failed'}
                            </Text>
                          )}
                        </TableData>
                      )}
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
