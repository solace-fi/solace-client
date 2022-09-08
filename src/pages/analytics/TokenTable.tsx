import React from 'react'
import { Flex, Scrollable } from '../../components/atoms/Layout'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import { Text } from '../../components/atoms/Typography'
import { Z_TABLE } from '../../constants'
import { truncateValue } from '../../utils/formatting'
import { useAnalyticsContext } from './AnalyticsContext'

export const TokenTable = () => {
  const { data } = useAnalyticsContext()
  const { tokenDetails } = data

  return (
    <Scrollable style={{ padding: '0 10px 0 10px' }} maxDesktopHeight={'50vh'} maxMobileHeight={'50vh'}>
      <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
        <TableHead sticky zIndex={Z_TABLE + 1}>
          <TableRow>
            <TableHeader>Token</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Weight</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokenDetails
            .sort((a, b) => b.weight - a.weight)
            .map((info, i) => (
              <TableRow key={i}>
                <TableData>
                  <Flex gap={5} justifyCenter>
                    <img src={`https://assets.solace.fi/${info.symbol.toLowerCase()}`} height={20} />
                    <Text autoAlignVertical semibold>
                      {info.symbol.toUpperCase()}
                    </Text>
                  </Flex>
                </TableData>
                <TableData>
                  <Text autoAlignVertical>${truncateValue(info.price, 4)}</Text>
                </TableData>
                <TableData>
                  <Text autoAlignVertical>{truncateValue(info.weight * 100, 2)}%</Text>
                </TableData>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Scrollable>
  )
}
