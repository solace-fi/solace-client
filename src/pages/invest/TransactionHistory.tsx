/* import react */
import React from 'react'

/* import constants */
import { DEFAULT_CHAIN_ID } from '../../constants'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'

/* import components */
import { Loader } from '../../components/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../../components/Table'
import { Button } from '../../components/Button'
import { Heading1, Text } from '../../components/Text'
import { Content } from '../../components/Layout'
import { HyperLink } from '../../components/Link'

/* import hooks */
import { useTransactionDetails } from '../../hooks/useTransactionHistory'

/* import utils */
import { getEtherscanTxUrl } from '../../utils/etherscan'
import { shortenAddress } from '../../utils/formatting'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'
import { useContractArray } from '../../hooks/useContract'

export const TransactionHistory: React.FC = () => {
  const { txHistory, amounts } = useTransactionDetails()
  const wallet = useWallet()
  const { localTransactions } = useUserData()
  const contractAddrs = useContractArray()

  return (
    <Content>
      <Heading1>Your transactions</Heading1>
      <Table textAlignCenter>
        <TableHead>
          <TableRow>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Time</TableHeader>
            <TableHeader>Hash</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {localTransactions &&
            localTransactions.map((pendingtx: any, i: number) => (
              <TableRow key={i}>
                <TableData>{pendingtx.type}</TableData>
                <TableData>{`${pendingtx.value} ${pendingtx.unit}`}</TableData>
                <TableData>{timeAgo(Number(Date.now()) * 1000)}</TableData>
                <TableData>
                  <HyperLink
                    href={getEtherscanTxUrl(wallet.chainId ?? DEFAULT_CHAIN_ID, pendingtx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>{shortenAddress(pendingtx.hash)} </Button>
                  </HyperLink>
                </TableData>
                <TableData>{pendingtx.status}</TableData>
              </TableRow>
            ))}

          {txHistory &&
            txHistory.map((tx: any, i: number) => (
              <TableRow key={tx.hash}>
                <TableData>
                  {amounts.length > 0 ? (
                    decodeInput(tx, wallet.chainId ?? DEFAULT_CHAIN_ID, contractAddrs).function_name
                  ) : (
                    <Loader width={10} height={10} />
                  )}
                </TableData>
                <TableData>{amounts.length > 0 && amounts[i]}</TableData>
                <TableData>{amounts.length > 0 && timeAgo(Number(tx.timeStamp) * 1000)}</TableData>
                <TableData>
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
                <TableData>
                  {amounts.length > 0 && (
                    <Text error={tx.txreceipt_status != '1'}>{tx.txreceipt_status == '1' ? 'Complete' : 'Failed'}</Text>
                  )}
                </TableData>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Content>
  )
}
