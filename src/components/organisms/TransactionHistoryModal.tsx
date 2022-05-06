/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    TransactionHistoryModal function
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React, { useCallback } from 'react'

/* import constants */
import { BKPT_5, BKPT_3, Z_TABLE } from '../../constants'
import { ExplorerscanApi } from '../../constants/enums'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { Scrollable } from '../atoms/Layout'
import { HyperLink } from '../atoms/Link'
import { Loader } from '../atoms/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../atoms/Table'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useFetchTxHistoryByAddress } from '../../hooks/api/useTransactionHistory'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'
import { shortenAddress } from '../../utils/formatting'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'
import { useWeb3React } from '@web3-react/core'

interface TransactionHistoryModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ closeModal, isOpen }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { activeNetwork } = useNetwork()
  const { localTransactions } = useCachedData()
  const { contractSources } = useContracts()
  const { account } = useWeb3React()
  const { width } = useWindowDimensions()
  const txHistory = useFetchTxHistoryByAddress()
  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'My Recent Transactions'} disableCloseButton={false}>
      {account && (
        <>
          <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={60}>
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
