/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    styled components

    TransactionHistory function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import styled from 'styled-components'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { ExplorerscanApi } from '../../constants/enums'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../atoms/Button'
import { CustomScrollbar } from '../atoms/Layout'
import { HyperLink } from '../atoms/Link'
import { Loader } from '../atoms/Loader'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData } from '../atoms/Table'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useTransactionDetails } from '../../hooks/useTransactionHistory'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'
import { shortenAddress } from '../../utils/formatting'
import { timeAgo } from '../../utils/time'
import { decodeInput } from '../../utils/decoder'

/*************************************************************************************

  styled components

  *************************************************************************************/

const Scrollable = styled.div`
  max-height: 60vh;
  overflow-y: scroll;
  ${CustomScrollbar}

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    max-height: 85vh;
  }
`

export const TransactionHistory: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { txHistory, amounts } = useTransactionDetails()
  const { activeNetwork } = useNetwork()
  const { localTransactions } = useCachedData()
  const { contractSources } = useContracts()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Scrollable>
      <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky>
          <TableRow>
            <TableHeader>Type</TableHeader>
            {width > MAX_TABLET_SCREEN_WIDTH && (
              <>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Time</TableHeader>
              </>
            )}
            <TableHeader>Hash</TableHeader>
            {width > MAX_TABLET_SCREEN_WIDTH && <TableHeader>Status</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {localTransactions.map((pendingtx: any, i: number) => (
            <TableRow isHighlight key={i}>
              <TableData high_em pt={10} pb={10}>
                {pendingtx.type}
              </TableData>
              {width > MAX_TABLET_SCREEN_WIDTH && (
                <>
                  <TableData high_em pt={10} pb={10}>{`${pendingtx.value} ${pendingtx.unit}`}</TableData>
                  <TableData high_em pt={10} pb={10}>
                    {timeAgo(Number(Date.now()) * 1000)}
                  </TableData>
                </>
              )}
              <TableData high_em pt={10} pb={10}>
                <HyperLink
                  href={getExplorerItemUrl(activeNetwork.explorer.url, pendingtx.hash, ExplorerscanApi.TX)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>{shortenAddress(pendingtx.hash)} </Button>
                </HyperLink>
              </TableData>
              {width > MAX_TABLET_SCREEN_WIDTH && (
                <TableData high_em pt={10} pb={10}>
                  <Text>{pendingtx.status}</Text>
                </TableData>
              )}
            </TableRow>
          ))}
          {txHistory &&
            txHistory.map((tx: any, i: number) => (
              <TableRow key={tx.hash}>
                <TableData
                  high_em
                  error={tx.txreceipt_status != '1'}
                  pt={10}
                  pb={10}
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
                    <TableData high_em pt={10} pb={10}>
                      {amounts.length > 0 && amounts[i]}
                    </TableData>
                    <TableData high_em pt={10} pb={10}>
                      {amounts.length > 0 && timeAgo(Number(tx.timeStamp) * 1000)}
                    </TableData>
                  </>
                )}
                <TableData
                  high_em
                  pt={10}
                  pb={10}
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
                  <TableData high_em pt={10} pb={10}>
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
  )
}
