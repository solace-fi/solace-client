/* import react */
import React from 'react'

/* import constants */
import { DEFAULT_CHAIN_ID } from '../constants'

/* import managers */
import { useWallet } from '../context/WalletManager'
import { useUserData } from '../context/UserDataManager'

/* import components */
import { Loader } from '../components/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../components/Table'
import { Button } from '../components/Button'
import { Text } from '../components/Text'
import { HyperLink } from '../components/Link'
import { CustomScrollbar } from '../components/Layout'

/* import hooks */
import { useTransactionDetails } from '../hooks/useTransactionHistory'

/* import utils */
import { getEtherscanTxUrl } from '../utils/etherscan'
import { shortenAddress } from '../utils/formatting'
import { timeAgo } from '../utils/time'
import { decodeInput } from '../utils/decoder'
import { useContractArray } from '../hooks/useContract'
import styled from 'styled-components'

const Scrollable = styled.div`
  max-height: 60vh;
  overflow-y: scroll;
  ${CustomScrollbar}
`

export const TransactionHistory: React.FC = () => {
  const { txHistory, amounts } = useTransactionDetails()
  const wallet = useWallet()
  const { localTransactions } = useUserData()
  const contractAddrs = useContractArray()

  return (
    <Scrollable>
      <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead
          style={{
            position: 'sticky',
            transform: 'translateY(-7px)',
            top: '7px',
            backgroundColor: 'rgba(16, 32, 97, 0.7)',
          }}
        >
          <TableRow>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Time</TableHeader>
            <TableHeader>Hash</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {localTransactions.map((pendingtx: any, i: number) => (
            <TableRow isHighlight key={i}>
              <TableData pt={10} pb={10}>
                {pendingtx.type}
              </TableData>
              <TableData pt={10} pb={10}>{`${pendingtx.value} ${pendingtx.unit}`}</TableData>
              <TableData pt={10} pb={10}>
                {timeAgo(Number(Date.now()) * 1000)}
              </TableData>
              <TableData pt={10} pb={10}>
                <HyperLink
                  href={getEtherscanTxUrl(wallet.chainId ?? DEFAULT_CHAIN_ID, pendingtx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>{shortenAddress(pendingtx.hash)} </Button>
                </HyperLink>
              </TableData>
              <TableData pt={10} pb={10}>
                <Text>{pendingtx.status}</Text>
              </TableData>
            </TableRow>
          ))}
          {txHistory &&
            txHistory.map((tx: any, i: number) => (
              <TableRow key={tx.hash}>
                <TableData pt={10} pb={10}>
                  {amounts.length > 0 ? (
                    decodeInput(tx, wallet.chainId ?? DEFAULT_CHAIN_ID, contractAddrs).function_name
                  ) : (
                    <Loader width={10} height={10} />
                  )}
                </TableData>
                <TableData pt={10} pb={10}>
                  {amounts.length > 0 && amounts[i]}
                </TableData>
                <TableData pt={10} pb={10}>
                  {amounts.length > 0 && timeAgo(Number(tx.timeStamp) * 1000)}
                </TableData>
                <TableData pt={10} pb={10}>
                  {amounts.length > 0 && (
                    <HyperLink
                      href={getEtherscanTxUrl(wallet.chainId ?? DEFAULT_CHAIN_ID, tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button>{shortenAddress(tx.hash)} </Button>
                    </HyperLink>
                  )}
                </TableData>
                <TableData pt={10} pb={10}>
                  {amounts.length > 0 && (
                    <Text error={tx.txreceipt_status != '1'}>{tx.txreceipt_status == '1' ? 'Complete' : 'Failed'}</Text>
                  )}
                </TableData>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Scrollable>
  )
}
